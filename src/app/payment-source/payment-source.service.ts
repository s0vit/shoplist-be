import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaymentSource, PaymentSourceDocument } from './models/payment-source.model';
import { PaymentSourceInputDto } from './dto/payment-source-input.dto';
import { PAYMENT_SOURCE_ERROR } from './constants/error.constant';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentSourceOutputDto } from './dto/payment-source-output.dto';
import { UtilsService } from '../../common/utils/utils.service';

@Injectable()
export class PaymentSourceService {
  constructor(
    @InjectModel(PaymentSource.name)
    private readonly paymentSourceModel: Model<PaymentSourceDocument>,
    private readonly utilsService: UtilsService,
  ) {}

  async create(userId: string, inputDTO: PaymentSourceInputDto): Promise<PaymentSourceOutputDto> {
    const titleToSearch = this.utilsService.createTitleRegex(inputDTO.title);
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
      comments: inputDTO.comments,
      color: inputDTO.color,
    });
    return (await newPaymentSource.save()).toObject({ versionKey: false });
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
    return toBeDeletedPaymentSource.toObject({ versionKey: false });
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
      comments: inputDTO.comments,
      color: inputDTO.color,
      updatedAt: Date.now(),
    });
    await paymentSource.save();
    return paymentSource.toObject({ versionKey: false });
  }

  async getOne(id: string, userId: string): Promise<PaymentSourceOutputDto> {
    const paymentSource = await this.paymentSourceModel.findById(id);
    if (!paymentSource) {
      throw new ConflictException(PAYMENT_SOURCE_ERROR.NOT_FOUND);
    }
    if (paymentSource.userId !== userId) {
      throw new UnauthorizedException(PAYMENT_SOURCE_ERROR.UNAUTHORIZED_ACCESS);
    }
    return paymentSource.toObject({ versionKey: false });
  }

  async getAll(userId: string): Promise<PaymentSourceOutputDto[]> {
    return this.paymentSourceModel.find({ userId }).select('-__v').lean();
  }
}
