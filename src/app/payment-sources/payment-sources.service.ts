import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaymentSource } from './models/payment-source.model';
import { PaymentSourceInputDto } from './dto/payment-source-input.dto';
import { PAYMENT_SOURCES_ERROR } from './constants/error.constant';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentSourceOutputDto } from './dto/payment-source-output.dto';

@Injectable()
export class PaymentSourcesService {
  constructor(
    @InjectModel(PaymentSource.name)
    private readonly paymentSourcesModel: Model<PaymentSource>,
  ) {}

  async create(userId: string, inputDTO: PaymentSourceInputDto): Promise<PaymentSourceOutputDto> {
    const titleToSearch = new RegExp(`^${inputDTO.title}$`, 'i');
    const existingPaymentSourceForCurrentUser = await this.paymentSourcesModel.findOne({
      title: titleToSearch,
      userId,
    });
    if (existingPaymentSourceForCurrentUser) {
      throw new ConflictException(PAYMENT_SOURCES_ERROR.EXIST);
    }
    const newPaymentSource = new this.paymentSourcesModel({
      title: inputDTO.title,
      userId,
      comments: inputDTO.comments,
      color: inputDTO.color,
    });
    return (await newPaymentSource.save()).toObject({ versionKey: false });
  }

  async delete(id: string, userId: string): Promise<PaymentSourceOutputDto> {
    const toBeDeletedPaymentSource = await this.paymentSourcesModel.findById(id);
    if (!toBeDeletedPaymentSource) {
      throw new ConflictException(PAYMENT_SOURCES_ERROR.NOT_FOUND);
    }
    if (toBeDeletedPaymentSource.userId !== userId) {
      throw new UnauthorizedException(PAYMENT_SOURCES_ERROR.UNAUTHORIZED_ACCESS);
    }
    await toBeDeletedPaymentSource.deleteOne();
    return toBeDeletedPaymentSource.toObject({ versionKey: false });
  }

  async update(id: string, inputDTO: PaymentSourceInputDto, userId: string): Promise<PaymentSourceOutputDto> {
    const paymentSource = await this.paymentSourcesModel.findById(id);
    if (!paymentSource) {
      throw new ConflictException(PAYMENT_SOURCES_ERROR.NOT_FOUND);
    }
    if (paymentSource.userId !== userId) {
      throw new UnauthorizedException(PAYMENT_SOURCES_ERROR.FORBIDDEN);
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
    const paymentSource = await this.paymentSourcesModel.findById(id);
    if (!paymentSource) {
      throw new ConflictException(PAYMENT_SOURCES_ERROR.NOT_FOUND);
    }
    if (paymentSource.userId !== userId) {
      throw new UnauthorizedException(PAYMENT_SOURCES_ERROR.UNAUTHORIZED_ACCESS);
    }
    return paymentSource.toObject({ versionKey: false });
  }

  async getAll(userId: string): Promise<PaymentSourceOutputDto[]> {
    return this.paymentSourcesModel.find({ userId }).select('-__v').lean();
  }
}
