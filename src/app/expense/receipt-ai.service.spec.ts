import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { ReceiptAiService } from './receipt-ai.service';
import { UnprocessableEntityException } from '@nestjs/common';

const createFile = (): Express.Multer.File =>
  ({
    buffer: Buffer.from('image-bytes'),
    mimetype: 'image/png',
    size: 12,
    fieldname: 'receipt',
    originalname: 'receipt.png',
    encoding: '7bit',
    stream: null,
    destination: undefined,
    filename: undefined,
    path: undefined,
  }) as unknown as Express.Multer.File;

const mockResponse = (payload: unknown) =>
  ({
    data: payload,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }) as unknown;

describe('ReceiptAiService', () => {
  let service: ReceiptAiService;
  let httpService: Pick<HttpService, 'post'>;
  let configService: Pick<ConfigService, 'get'>;
  let categoryModel: any;
  let paymentSourceModel: any;
  let userConfigModel: any;

  beforeEach(() => {
    httpService = {
      post: jest.fn(),
    } as unknown as Pick<HttpService, 'post'>;

    configService = {
      get: jest.fn().mockReturnValue('test-api-key'),
    } as unknown as Pick<ConfigService, 'get'>;

    const categoryQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: 'cat-1', title: 'Groceries' }]),
    };
    const paymentSourceQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: 'ps-1', title: 'Card' }]),
    };
    const userConfigQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ currency: 'USD' }),
    };

    categoryModel = {
      find: jest.fn().mockReturnValue(categoryQuery),
    };
    paymentSourceModel = {
      find: jest.fn().mockReturnValue(paymentSourceQuery),
    };
    userConfigModel = {
      findOne: jest.fn().mockReturnValue(userConfigQuery),
    };

    service = new ReceiptAiService(
      configService as ConfigService,
      httpService as HttpService,
      categoryModel,
      paymentSourceModel,
      userConfigModel,
    );
  });

  it('returns normalized expense input when receipt is recognized', async () => {
    const candidate = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '{"recognized":true,"reason":"Parsed successfully","expense":{"amount":4500.5,"currency":"usd","categoryId":"cat-1","paymentSourceId":"ps-1","comments":"Grocery run","createdAt":"2024-06-12"}}',
              },
            ],
          },
        },
      ],
    };

    (httpService.post as jest.Mock).mockReturnValue(of(mockResponse(candidate)));

    const result = await service.parseReceipt({
      image: createFile(),
      userId: 'user-1',
    });

    expect(categoryModel.find).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(paymentSourceModel.find).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(userConfigModel.findOne).toHaveBeenCalledWith({ userId: 'user-1' });

    expect(result.expenseInput.amount).toBe(4500.5);
    expect(result.expenseInput.currency).toBe('USD');
    expect(result.expenseInput.categoryId).toBe('cat-1');
    expect(result.expenseInput.paymentSourceId).toBe('ps-1');
    expect(result.expenseInput.comments).toBe('Grocery run');
    expect(result.expenseInput.createdAt).toBeInstanceOf(Date);
    expect(result.reason).toBe('Parsed successfully');
  });

  it('throws when receipt is not recognized', async () => {
    const candidate = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '{"recognized":false,"reason":"Blurry photo","expense":null}',
              },
            ],
          },
        },
      ],
    };

    (httpService.post as jest.Mock).mockReturnValue(of(mockResponse(candidate)));

    await expect(
      service.parseReceipt({
        image: createFile(),
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('throws when model returns unknown category id', async () => {
    const candidate = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '{"recognized":true,"reason":null,"expense":{"amount":1200,"currency":"USD","categoryId":"unknown","paymentSourceId":"ps-1"}}',
              },
            ],
          },
        },
      ],
    };

    (httpService.post as jest.Mock).mockReturnValue(of(mockResponse(candidate)));

    await expect(
      service.parseReceipt({
        image: createFile(),
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('retries when model returns non-json answer', async () => {
    const invalidCandidate = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Here is what I found: amount 1000',
              },
            ],
          },
        },
      ],
    };

    const validCandidate = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '{"recognized":true,"reason":null,"expense":{"amount":1000,"currency":null,"categoryId":"cat-1","paymentSourceId":"ps-1","comments":null,"createdAt":null}}',
              },
            ],
          },
        },
      ],
    };

    (httpService.post as jest.Mock)
      .mockReturnValueOnce(of(mockResponse(invalidCandidate)))
      .mockReturnValueOnce(of(mockResponse(validCandidate)));

    const result = await service.parseReceipt({
      image: createFile(),
      userId: 'user-1',
    });

    expect((httpService.post as jest.Mock).mock.calls.length).toBe(2);
    expect(result.expenseInput.amount).toBe(1000);
    expect(result.expenseInput.currency).toBe('USD'); // fallback to user config currency
  });
});
