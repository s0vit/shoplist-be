import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaymentSource, PaymentSourceDocument } from './models/payment-source.model';
import { PaymentSourceInputDto } from './dto/payment-source-input.dto';
import { PAYMENT_SOURCE_ERROR } from './constants/error.constant';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentSourceOutputDto } from './dto/payment-source-output.dto';
import { UtilsService } from '../../common/utils/utils.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PaymentSourceService {
  constructor(
    @InjectModel(PaymentSource.name)
    private readonly paymentSourceModel: Model<PaymentSourceDocument>,
    private readonly jwtService: JwtService,
    private readonly utilsService: UtilsService,
  ) {}

  async create(userId: string, inputDTO: PaymentSourceInputDto): Promise<PaymentSourceOutputDto> {
    const titleToSearch = this.utilsService.createCaseInsensitiveRegexFromString(inputDTO.title);
    const existingPaymentSourceForCurrentUser = await this.paymentSourceModel.findOne({
      title: titleToSearch,
      userId,
    });

    if (existingPaymentSourceForCurrentUser) {
      throw new ConflictException(PAYMENT_SOURCE_ERROR.EXIST);
    }

    const newPaymentSource = new this.paymentSourceModel({
      title: inputDTO.title,
      userId,
      comments: inputDTO.comments || '',
      color: inputDTO.color,
      order: await this.paymentSourceModel.countDocuments({ userId }),
    });

    const saved = await newPaymentSource.save();
    const result = saved.toObject({ versionKey: false });
    return {
      _id: result._id.toString(),
      userId: result.userId.toString(),
      title: result.title,
      comments: result.comments || '',
      color: result.color,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async delete(id: string, userId: string): Promise<PaymentSourceOutputDto> {
    const toBeDeletedPaymentSource = await this.paymentSourceModel.findById(id);

    if (!toBeDeletedPaymentSource) {
      throw new ConflictException(PAYMENT_SOURCE_ERROR.NOT_FOUND);
    }

    if (toBeDeletedPaymentSource.userId !== userId) {
      throw new UnauthorizedException(PAYMENT_SOURCE_ERROR.UNAUTHORIZED_ACCESS);
    }

    await toBeDeletedPaymentSource.deleteOne();

    const result = toBeDeletedPaymentSource.toObject({ versionKey: false });
    return {
      _id: result._id.toString(),
      userId: result.userId.toString(),
      title: result.title,
      comments: result.comments || '',
      color: result.color,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async update(id: string, inputDTO: PaymentSourceInputDto, userId: string): Promise<PaymentSourceOutputDto> {
    const paymentSource = await this.paymentSourceModel.findById(id);

    if (!paymentSource) {
      throw new ConflictException(PAYMENT_SOURCE_ERROR.NOT_FOUND);
    }

    if (paymentSource.userId !== userId) {
      throw new UnauthorizedException(PAYMENT_SOURCE_ERROR.FORBIDDEN);
    }

    paymentSource.set({
      title: inputDTO.title,
      comments: inputDTO.comments || '',
      color: inputDTO.color,
      updatedAt: Date.now(),
    });
    await paymentSource.save();

    const result = paymentSource.toObject({ versionKey: false });
    return {
      _id: result._id.toString(),
      userId: result.userId.toString(),
      title: result.title,
      comments: result.comments || '',
      color: result.color,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async getOne(id: string, accessToken: string): Promise<PaymentSourceOutputDto> {
    if (!accessToken) {
      throw new BadRequestException('Access token is missing');
    }

    const userId = this.jwtService.decode(accessToken)['userId'];
    const paymentSource = await this.paymentSourceModel.findById(id);

    if (!paymentSource) {
      throw new ConflictException(PAYMENT_SOURCE_ERROR.NOT_FOUND);
    }

    if (paymentSource.userId !== userId) {
      throw new UnauthorizedException(PAYMENT_SOURCE_ERROR.UNAUTHORIZED_ACCESS);
    }

    const result = paymentSource.toObject({ versionKey: false });
    return {
      _id: result._id.toString(),
      userId: result.userId.toString(),
      title: result.title,
      comments: result.comments || '',
      color: result.color,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async getAll(accessToken: string): Promise<PaymentSourceOutputDto[]> {
    if (!accessToken) {
      throw new BadRequestException('Access token is missing');
    }

    const userId = this.jwtService.decode(accessToken)['userId'];

    const results = await this.paymentSourceModel.find({ userId }).sort({ order: 1 }).select('-__v').lean();
    return results.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      title: doc.title,
      comments: doc.comments || '',
      color: doc.color,
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async createDefaultPaymentSources(userId: string): Promise<void> {
    const defaultPaymentSources = [
      { title: 'Cash', color: '#00fa58' },
      { title: 'Credit Card', color: '#0000FF' },
      { title: 'Debit Card', color: '#ecff00' },
    ];

    const titlesToSearch = defaultPaymentSources.map((paymentSource) =>
      this.utilsService.createCaseInsensitiveRegexFromString(paymentSource.title),
    );

    const existingPaymentSources = await this.paymentSourceModel.find({
      title: { $in: titlesToSearch },
      userId,
    });

    const existingTitles = new Set(existingPaymentSources.map((source) => source.title));

    const newPaymentSources = defaultPaymentSources
      .filter((paymentSource) => !existingTitles.has(paymentSource.title))
      .map((paymentSource) => ({
        title: paymentSource.title,
        userId,
        color: paymentSource.color,
      }));

    if (newPaymentSources.length > 0) {
      await this.paymentSourceModel.insertMany(newPaymentSources);
    }
  }

  async updateOrder(id: string, newOrder: number, userId: string): Promise<PaymentSourceOutputDto> {
    const paymentSource = await this.paymentSourceModel.findById(id);

    if (!paymentSource) {
      throw new ConflictException(PAYMENT_SOURCE_ERROR.NOT_FOUND);
    }

    if (paymentSource.userId !== userId) {
      throw new UnauthorizedException(PAYMENT_SOURCE_ERROR.FORBIDDEN);
    }

    // if we move payment source up, we need to decrement order of all payment sources from old order to new order
    // if we move payment source down, we need to increment order of all payment sources from new order to old order
    const increment = paymentSource.order > newOrder ? 1 : -1;
    const condition =
      paymentSource.order > newOrder
        ? { $lte: paymentSource.order, $gte: newOrder }
        : { $gte: paymentSource.order, $lte: newOrder };

    await this.paymentSourceModel.updateMany({ userId, order: condition }, { $inc: { order: increment } });

    paymentSource.set({ order: newOrder });
    await paymentSource.save();

    const result = paymentSource.toObject({ versionKey: false });
    return {
      _id: result._id.toString(),
      userId: result.userId.toString(),
      title: result.title,
      comments: result.comments || '',
      color: result.color,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}
