import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Category, CategoryDocument } from '../category/models/category.model';
import { PaymentSource, PaymentSourceDocument } from '../payment-source/models/payment-source.model';
import { UserConfig, UserConfigDocument } from '../user-config/model/user-config.model';
import { ExpenseInputDto } from './dto/expense-input.dto';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';

type ReceiptOption = {
  id: string;
  name: string;
};

type ReceiptParseParams = {
  image: Express.Multer.File;
  userId: string;
};

type GeminiExpenseResponse = {
  recognized: boolean;
  reason?: string | null;
  expense?: {
    amount?: number | string;
    currency?: string | null;
    categoryId?: string;
    paymentSourceId?: string;
    comments?: string | null;
    createdAt?: string | null;
  } | null;
};

type ReceiptParseResult = {
  expenseInput: ExpenseInputDto;
  reason?: string | null;
};

const MAX_ATTEMPTS = 3;

@Injectable()
export class ReceiptAiService {
  private readonly logger = new Logger(ReceiptAiService.name);
  private readonly modelId = 'gemini-2.0-flash-001';
  private readonly endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent`;
  private readonly supportedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(PaymentSource.name) private readonly paymentSourceModel: Model<PaymentSourceDocument>,
    @InjectModel(UserConfig.name) private readonly userConfigModel: Model<UserConfigDocument>,
  ) {}

  async parseReceipt(params: ReceiptParseParams): Promise<ReceiptParseResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.error('Missing GEMINI_API_KEY environment variable.');
      throw new InternalServerErrorException('Gemini API key is not configured');
    }

    const { image, userId } = params;

    this.ensureValidImage(image);

    const [categories, paymentSources, preferredCurrency] = await Promise.all([
      this.fetchCategories(userId),
      this.fetchPaymentSources(userId),
      this.fetchPreferredCurrency(userId),
    ]);

    this.ensureRequiredData(categories, paymentSources);

    const base64Image = image.buffer.toString('base64');

    let lastJsonError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const prompt = this.buildPrompt(categories, paymentSources, preferredCurrency, attempt);

      let responseData: Record<string, unknown>;

      try {
        const response = await firstValueFrom(
          this.httpService.post(
            this.endpoint,
            {
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inline_data: {
                        mime_type: image.mimetype,
                        data: base64Image,
                      },
                    },
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              timeout: 20000,
            },
          ),
        );

        responseData = response?.data as Record<string, unknown>;
      } catch (err) {
        const error = err as { response?: { status?: number; data?: unknown } };
        this.logger.error(`Gemini API request failed`, error);

        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new InternalServerErrorException('Gemini API rejected the request. Check API key and quota.');
        }

        throw new UnprocessableEntityException('Не удалось распознать чек');
      }

      const candidateText = this.extractCandidateText(responseData);
      const parsed = this.tryParseGeminiJson(candidateText);

      if (!parsed) {
        lastJsonError = new Error('JSON_PARSE_ERROR');
        this.logger.warn(`Gemini response was not valid JSON (attempt ${attempt}).`);
        continue;
      }

      if (typeof parsed.recognized !== 'boolean') {
        lastJsonError = new Error('JSON_STRUCTURE_ERROR');
        this.logger.warn(`Gemini JSON missing required "recognized" field (attempt ${attempt}).`);
        continue;
      }

      if (!parsed.recognized) {
        throw new UnprocessableEntityException(parsed.reason || 'Чек не распознан моделью');
      }

      if (!parsed.expense) {
        throw new UnprocessableEntityException('Модель не вернула данные о трате');
      }

      const expenseInput = this.normalizeExpenseInput(parsed.expense, categories, paymentSources, preferredCurrency);

      return {
        expenseInput,
        reason: parsed.reason ?? null,
      };
    }

    if (lastJsonError) {
      throw new UnprocessableEntityException('Модель вернула некорректный JSON');
    }

    throw new UnprocessableEntityException('Не удалось распознать чек');
  }

  private ensureValidImage(image: Express.Multer.File | undefined) {
    if (!image) {
      throw new BadRequestException('Необходимо загрузить фотографию чека');
    }

    if (!this.supportedMimeTypes.has(image.mimetype)) {
      throw new BadRequestException('Поддерживаются только изображения JPEG, PNG или WEBP');
    }
  }

  private ensureRequiredData(categories: ReceiptOption[], paymentSources: ReceiptOption[]) {
    if (!categories.length) {
      throw new UnprocessableEntityException('Для пользователя не найдены категории трат');
    }

    if (!paymentSources.length) {
      throw new UnprocessableEntityException('Для пользователя не найдены источники трат');
    }
  }

  private async fetchCategories(userId: string): Promise<ReceiptOption[]> {
    const results = await this.categoryModel.find({ userId }).select('_id title').lean();

    return results.map((doc) => ({
      id: doc._id.toString(),
      name: doc.title,
    }));
  }

  private async fetchPaymentSources(userId: string): Promise<ReceiptOption[]> {
    const results = await this.paymentSourceModel.find({ userId }).select('_id title').lean();

    return results.map((doc) => ({
      id: doc._id.toString(),
      name: doc.title,
    }));
  }

  private async fetchPreferredCurrency(userId: string): Promise<string | null> {
    const config = await this.userConfigModel.findOne({ userId }).select('currency').lean();

    if (!config?.currency) {
      return null;
    }

    return config.currency.toString().trim().toUpperCase();
  }

  private buildPrompt(
    categories: ReceiptOption[],
    paymentSources: ReceiptOption[],
    preferredCurrency: string | null | undefined,
    attempt: number,
  ): string {
    const categoriesJson = JSON.stringify(categories, null, 2);
    const paymentSourcesJson = JSON.stringify(paymentSources, null, 2);
    const fallbackCurrencyInstruction = preferredCurrency
      ? `If the receipt does not explicitly show the currency even after carefully checking symbols and wording, default to "${preferredCurrency}".`
      : 'If the receipt does not explicitly show the currency even after carefully checking symbols and wording, leave it null.';

    const attemptReminder =
      attempt > 1
        ? `\nATTEMPT ${attempt}: Previous response was not valid JSON. Return ONLY raw JSON with no Markdown, no commentary.`
        : '';

    return [
      'You are a financial assistant that extracts expense data from receipt photos.',
      'Use only categoryId and paymentSourceId from the provided lists when preparing the expense.',
      'If anything is unreadable set recognized to false and explain why.',
      'Currency detection is critical: scan the receipt for currency codes (e.g., USD, EUR, KZT), symbols ($, €, ₸, ₴, ₺, ₽), and localized words (e.g., тенге, доллар, евро).',
      'If the currency is still unclear, use the language of the receipt as a hint (e.g., Turkish text often implies TRY, Kazakh text mentioning “тенге” implies KZT, Russian text without explicit symbols implies RUB, most European languages imply EUR).',
      'If multiple currencies appear, choose the one attached to the final total. Always output the currency as a three-letter ISO code in uppercase.',
      'Map common symbols to ISO codes: $ -> USD unless otherwise stated, ₸ -> KZT, ₴ -> UAH, ₽ -> RUB, ₺ -> TRY, € -> EUR, £ -> GBP.',
      'If the total amount contains a trailing currency symbol or word (e.g., "4500 ₸", "4500 тенге"), use that currency.',
      '',
      `Categories JSON:\n${categoriesJson}`,
      '',
      `Payment sources JSON:\n${paymentSourcesJson}`,
      '',
      fallbackCurrencyInstruction,
      '',
      'Ensure the amount represents the final total to pay (use dot as decimal separator).',
      'Prefer the purchase date/time from the receipt; fallback to today if missing.',
      'RESPONSE FORMAT:',
      'Return ONLY raw JSON with the following structure:',
      '{',
      '  "recognized": boolean,',
      '  "reason": string | null,',
      '  "expense": {',
      '    "amount": number | string,',
      '    "currency": string | null,',
      '    "categoryId": string,',
      '    "paymentSourceId": string,',
      '    "comments": string | null,',
      '    "createdAt": string | null',
      '  }',
      '}',
      '',
      'Do not include Markdown fences, backticks, explanations, or additional text outside the JSON object.',
      attemptReminder,
    ].join('\n');
  }

  private extractCandidateText(data: unknown): string {
    if (!data || typeof data !== 'object') {
      throw new UnprocessableEntityException('Не удалось обработать ответ модели');
    }

    const candidates = (data as Record<string, unknown>).candidates as unknown[];

    if (!Array.isArray(candidates) || !candidates.length) {
      throw new UnprocessableEntityException('Модель не вернула кандидатов');
    }

    const parts = (candidates[0] as Record<string, unknown>)?.content as Record<string, unknown>;
    const firstPart = Array.isArray(parts?.parts) ? parts.parts[0] : undefined;

    const text = firstPart && typeof firstPart === 'object' ? (firstPart as Record<string, unknown>).text : undefined;

    if (typeof text !== 'string' || !text.trim()) {
      throw new UnprocessableEntityException('Модель не вернула текстовый ответ');
    }

    return text.trim();
  }

  private tryParseGeminiJson(raw: string): GeminiExpenseResponse | null {
    const sanitized = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(sanitized) as GeminiExpenseResponse;
    } catch (error) {
      this.logger.debug(`Failed to parse Gemini JSON response`, error as Error);

      return null;
    }
  }

  private normalizeExpenseInput(
    expense: NonNullable<GeminiExpenseResponse['expense']>,
    categories: ReceiptOption[],
    paymentSources: ReceiptOption[],
    preferredCurrency: string | null,
  ): ExpenseInputDto {
    const amount = this.toNumber(expense.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new UnprocessableEntityException('Модель вернула некорректную сумму');
    }

    const categoryId = this.validateOption('categoryId', expense.categoryId, categories);
    const paymentSourceId = this.validateOption('paymentSourceId', expense.paymentSourceId, paymentSources);

    const currency = this.resolveCurrency(expense.currency, preferredCurrency);
    const createdAt = this.normalizeDate(expense.createdAt);
    const comments = this.normalizeComment(expense.comments);

    return {
      amount,
      categoryId,
      paymentSourceId,
      currency,
      comments,
      createdAt,
    } as ExpenseInputDto;
  }

  private validateOption(
    field: 'categoryId' | 'paymentSourceId',
    value: string | undefined,
    options: ReceiptOption[],
  ): string {
    if (!value) {
      throw new UnprocessableEntityException(
        `Модель не выбрала ${field === 'categoryId' ? 'категорию' : 'источник оплаты'}`,
      );
    }

    const matched = options.find((option) => option.id === value);

    if (!matched) {
      throw new UnprocessableEntityException(`Модель вернула неизвестный идентификатор в поле ${field}`);
    }

    return matched.id;
  }

  private resolveCurrency(modelCurrency: string | null | undefined, preferredCurrency: string | null): CURRENCIES {
    const candidates = [modelCurrency, preferredCurrency, CURRENCIES.USD].filter(
      (value): value is string => typeof value === 'string' && Boolean(value.trim()),
    );

    for (const candidate of candidates) {
      const normalized = candidate.trim().toUpperCase();

      if (this.isSupportedCurrency(normalized)) {
        return normalized as CURRENCIES;
      }
    }

    return CURRENCIES.USD;
  }

  private normalizeDate(value?: string | null): Date {
    if (!value) {
      return new Date();
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
  }

  private normalizeComment(value?: string | null): string | undefined {
    if (!value) {
      return undefined;
    }

    const trimmed = value.toString().trim();

    if (!trimmed) {
      return undefined;
    }

    return trimmed.slice(0, 100);
  }

  private toNumber(value: number | string | undefined): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(',', '.').trim();
      const parsed = Number.parseFloat(normalized);

      return Number.isFinite(parsed) ? parsed : NaN;
    }

    return NaN;
  }

  private isSupportedCurrency(value: string): boolean {
    return (Object.values(CURRENCIES) as string[]).includes(value);
  }
}
