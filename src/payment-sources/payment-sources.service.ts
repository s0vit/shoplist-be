import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaymentSource } from './models/payment-source.model';
import { PaymentSourceInputDto } from './dto/payment-source-input.dto';
import { PaymentSourcesError } from './constants/error.constant';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentSourceResponseDto } from './dto/payment-source-response.dto';

@Injectable()
export class PaymentSourcesService {
  constructor(
    @InjectModel(PaymentSource.name)
    private readonly PaymentSourcesModel: Model<PaymentSource>,
  ) {}

  async create(userId: string, inputDTO: PaymentSourceInputDto): Promise<PaymentSourceResponseDto> {
    const titleToSearch = new RegExp(`^${inputDTO.title}$`, 'i');
    const existingPaymentSourceForCurrentUser = await this.PaymentSourcesModel.findOne({
      title: titleToSearch,
      userId,
    });
    if (existingPaymentSourceForCurrentUser) {
      throw new ConflictException(PaymentSourcesError.EXIST);
    }
    const newPaymentSource = new this.PaymentSourcesModel({
      title: inputDTO.title,
      userId,
      comments: inputDTO.comments,
      color: inputDTO.color,
    });
    return (await newPaymentSource.save()).toObject({ versionKey: false });
  }

  async delete(id: string, userId: string): Promise<PaymentSourceResponseDto> {
    const toBeDeletedPaymentSource = await this.PaymentSourcesModel.findById(id);
    if (!toBeDeletedPaymentSource) {
      throw new ConflictException(PaymentSourcesError.NOT_FOUND);
    }
    if (toBeDeletedPaymentSource.userId !== userId) {
      throw new UnauthorizedException(PaymentSourcesError.UNAUTHORIZED_ACCESS);
    }
    await toBeDeletedPaymentSource.deleteOne();
    return toBeDeletedPaymentSource.toObject({ versionKey: false });
  }

  async update(id: string, inputDTO: PaymentSourceInputDto, userId: string): Promise<PaymentSourceResponseDto> {
    const paymentSource = await this.PaymentSourcesModel.findById(id);
    if (!paymentSource) {
      throw new ConflictException(PaymentSourcesError.NOT_FOUND);
    }
    if (paymentSource.userId !== userId) {
      throw new UnauthorizedException(PaymentSourcesError.FORBIDDEN);
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

  async getOne(id: string, userId: string): Promise<PaymentSourceResponseDto> {
    const paymentSource = await this.PaymentSourcesModel.findById(id);
    if (!paymentSource) {
      throw new ConflictException(PaymentSourcesError.NOT_FOUND);
    }
    if (paymentSource.userId !== userId) {
      throw new UnauthorizedException(PaymentSourcesError.UNAUTHORIZED_ACCESS);
    }
    return paymentSource.toObject({ versionKey: false });
  }

  async getAll(userId: string): Promise<PaymentSourceResponseDto[]> {
    return this.PaymentSourcesModel.find({ userId }).select('-__v').lean();
  }
}
