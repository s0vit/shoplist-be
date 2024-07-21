import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ACCESS_CONTROL_ERROR } from './constants/access-control-error.enum';
import { AccessControlInputDto } from './dto/access-control-input.dto';
import { AccessControlOutputDto } from './dto/access-control-output.dto';
import { DeleteMeFromSharedInputDto } from './dto/delete-me-from-shared-input.dto';
import { AccessControl, AccessControlDocument } from './models/access-control.model';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectModel(AccessControl.name)
    private readonly accessControlModel: Model<AccessControlDocument>,
  ) {}

  async getAll(userId: string): Promise<AccessControlOutputDto[]> {
    return this.accessControlModel.find({ ownerId: userId }).select('-__v').lean();
  }

  async _getAllowedExpensesId(ownerId: string, participantID: string): Promise<string[]> {
    const result = await this.accessControlModel.findOne({ ownerId, sharedWith: participantID });
    if (result) return result.expenseIds;
  }

  async create(userId: string, dto: AccessControlInputDto): Promise<AccessControlOutputDto> {
    if (dto.sharedWith === userId) {
      throw new ForbiddenException(ACCESS_CONTROL_ERROR.OWN_ACCESS_ERROR);
    }

    try {
      // check if the owner has already shared access with the user
      const existingAccessControl = await this.accessControlModel.findOne({
        ownerId: userId,
        sharedWith: dto.sharedWith,
      });

      if (existingAccessControl) {
        if (
          existingAccessControl.expenseIds &&
          dto.expenseIds &&
          dto.expenseIds.some((id) => existingAccessControl.expenseIds.includes(id))
        ) {
          throw new ForbiddenException(ACCESS_CONTROL_ERROR.DUPLICATE_EXPENSES);
        }

        if (
          existingAccessControl.categoryIds &&
          dto.categoryIds &&
          dto.categoryIds.some((id) => existingAccessControl.categoryIds.includes(id))
        ) {
          throw new ForbiddenException(ACCESS_CONTROL_ERROR.DUPLICATE_CATEGORIES);
        }

        if (
          existingAccessControl.paymentSourceIds &&
          dto.paymentSourceIds &&
          dto.paymentSourceIds.some((id) => existingAccessControl.paymentSourceIds.includes(id))
        ) {
          throw new ForbiddenException(ACCESS_CONTROL_ERROR.DUPLICATE_PAYMENT_SOURCES);
        }

        // if the owner has already shared access with the user, update the access
        // TODO Simplify this code
        existingAccessControl.set({
          ownerId: userId,
          sharedWith: dto.sharedWith,
          expenseIds: dto.expenseIds
            ? existingAccessControl.expenseIds
              ? [...existingAccessControl.expenseIds, ...dto.expenseIds]
              : dto.expenseIds
            : existingAccessControl.expenseIds,
          categoryIds: dto.categoryIds
            ? existingAccessControl.categoryIds
              ? [...existingAccessControl.categoryIds, ...dto.categoryIds]
              : dto.categoryIds
            : existingAccessControl.categoryIds,
          paymentSourceIds: dto.paymentSourceIds
            ? existingAccessControl.paymentSourceIds
              ? [...existingAccessControl.paymentSourceIds, ...dto.paymentSourceIds]
              : dto.paymentSourceIds
            : existingAccessControl.paymentSourceIds,
          updatedAt: new Date(),
        });

        return (await existingAccessControl.save()).toObject({ versionKey: false });
      }

      const accessControl = new this.accessControlModel({ ownerId: userId, ...dto });
      const result = await accessControl.save();

      return result.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(ACCESS_CONTROL_ERROR.CREATE_ACCESS_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(userId: string, accessId: string, dto: AccessControlInputDto): Promise<AccessControlOutputDto> {
    if (dto.sharedWith === userId) {
      throw new ForbiddenException(ACCESS_CONTROL_ERROR.OWN_ACCESS_ERROR);
    }

    const result = await this.accessControlModel.findById(accessId);

    if (result?.ownerId !== userId) {
      throw new ForbiddenException(ACCESS_CONTROL_ERROR.FORBIDDEN);
    }

    if (!result) {
      throw new NotFoundException(ACCESS_CONTROL_ERROR.NOT_FOUND);
    }

    result.set({ ...dto, updatedAt: new Date() });
    result.save();

    return result.toObject({ versionKey: false });
  }

  async delete(userId: string, accessId: string): Promise<AccessControlOutputDto> {
    const result = await this.accessControlModel.findByIdAndDelete(accessId, { ownerId: userId });

    if (!result) {
      throw new NotFoundException(ACCESS_CONTROL_ERROR.DELETE_ACCESS_ERROR);
    }

    return result.toObject({ versionKey: false });
  }

  async deleteMeFromShared(userId: string, dto: DeleteMeFromSharedInputDto): Promise<AccessControlOutputDto> {
    const { accessId, expenseIds, paymentSourceIds, categoryIds } = dto;
    let accessControl: AccessControl;

    try {
      accessControl = await this.accessControlModel.findById(accessId);
    } catch (error) {
      throw new NotFoundException(ACCESS_CONTROL_ERROR.NOT_FOUND);
    }

    if (!accessControl || accessControl.sharedWith !== userId) {
      throw new NotFoundException(ACCESS_CONTROL_ERROR.NOT_FOUND);
    }

    accessControl.expenseIds = accessControl.expenseIds.filter((id) => !expenseIds.includes(id));
    accessControl.categoryIds = accessControl.categoryIds.filter((id) => !categoryIds.includes(id));
    accessControl.paymentSourceIds = accessControl.paymentSourceIds.filter((id) => !paymentSourceIds.includes(id));

    try {
      await this.accessControlModel.findByIdAndUpdate(accessId, accessControl);
    } catch (error) {
      throw new InternalServerErrorException(ACCESS_CONTROL_ERROR.DELETE_ME_ERROR);
    }

    return {
      _id: accessId,
      ownerId: accessControl.ownerId,
      sharedWith: accessControl.sharedWith,
      expenseIds: accessControl.expenseIds,
      categoryIds: accessControl.categoryIds,
      paymentSourceIds: accessControl.paymentSourceIds,
    };
  }

  async getSharedWithMe(userId: string): Promise<AccessControlOutputDto[]> {
    return this.accessControlModel.find({ sharedWith: userId }).select('-__v').lean();
  }
}
