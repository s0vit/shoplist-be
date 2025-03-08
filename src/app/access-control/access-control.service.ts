import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    const results = await this.accessControlModel.find({ ownerId: userId }).select('-__v').lean();
    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      sharedWith: doc.sharedWith.toString(),
      expenseIds: doc.expenseIds?.map((id) => id.toString()) || [],
      categoryIds: doc.categoryIds?.map((id) => id.toString()) || [],
      paymentSourceIds: doc.paymentSourceIds?.map((id) => id.toString()) || [],
    }));
  }

  async _getAllowedExpensesId(ownerId: string, participantID: string): Promise<string[]> {
    const result = await this.accessControlModel.findOne({ ownerId, sharedWith: participantID });
    if (result) return result.expenseIds.map((id) => id.toString());
    return [];
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

        const saved = await existingAccessControl.save();
        const result = saved.toObject({ versionKey: false });
        return {
          ...result,
          _id: result._id.toString(),
          ownerId: result.ownerId.toString(),
          sharedWith: result.sharedWith.toString(),
          expenseIds: result.expenseIds?.map((id) => id.toString()) || [],
          categoryIds: result.categoryIds?.map((id) => id.toString()) || [],
          paymentSourceIds: result.paymentSourceIds?.map((id) => id.toString()) || [],
        };
      }

      const accessControl = new this.accessControlModel({ ownerId: userId, ...dto });
      const saved = await accessControl.save();
      const result = saved.toObject({ versionKey: false });
      return {
        ...result,
        _id: result._id.toString(),
        ownerId: result.ownerId.toString(),
        sharedWith: result.sharedWith.toString(),
        expenseIds: result.expenseIds?.map((id) => id.toString()) || [],
        categoryIds: result.categoryIds?.map((id) => id.toString()) || [],
        paymentSourceIds: result.paymentSourceIds?.map((id) => id.toString()) || [],
      };
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
    const saved = await result.save();
    const updated = saved.toObject({ versionKey: false });
    return {
      ...updated,
      _id: updated._id.toString(),
      ownerId: updated.ownerId.toString(),
      sharedWith: updated.sharedWith.toString(),
      expenseIds: updated.expenseIds?.map((id) => id.toString()) || [],
      categoryIds: updated.categoryIds?.map((id) => id.toString()) || [],
      paymentSourceIds: updated.paymentSourceIds?.map((id) => id.toString()) || [],
    };
  }

  async delete(userId: string, accessId: string): Promise<AccessControlOutputDto> {
    const result = await this.accessControlModel.findByIdAndDelete(accessId, { ownerId: userId });

    if (!result) {
      throw new NotFoundException(ACCESS_CONTROL_ERROR.DELETE_ACCESS_ERROR);
    }

    const deleted = result.toObject({ versionKey: false });
    return {
      ...deleted,
      _id: deleted._id.toString(),
      ownerId: deleted.ownerId.toString(),
      sharedWith: deleted.sharedWith.toString(),
      expenseIds: deleted.expenseIds?.map((id) => id.toString()) || [],
      categoryIds: deleted.categoryIds?.map((id) => id.toString()) || [],
      paymentSourceIds: deleted.paymentSourceIds?.map((id) => id.toString()) || [],
    };
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
      const updated = await this.accessControlModel.findByIdAndUpdate(accessId, accessControl, { new: true });
      if (!updated) {
        throw new Error('Failed to update access control');
      }
      return {
        _id: updated._id.toString(),
        ownerId: updated.ownerId.toString(),
        sharedWith: updated.sharedWith.toString(),
        expenseIds: updated.expenseIds?.map((id) => id.toString()) || [],
        categoryIds: updated.categoryIds?.map((id) => id.toString()) || [],
        paymentSourceIds: updated.paymentSourceIds?.map((id) => id.toString()) || [],
      };
    } catch (error) {
      throw new InternalServerErrorException(ACCESS_CONTROL_ERROR.DELETE_ME_ERROR);
    }
  }

  async getSharedWithMe(userId: string): Promise<AccessControlOutputDto[]> {
    const results = await this.accessControlModel.find({ sharedWith: userId }).select('-__v').lean();
    return results.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      sharedWith: doc.sharedWith.toString(),
      expenseIds: doc.expenseIds?.map((id) => id.toString()) || [],
      categoryIds: doc.categoryIds?.map((id) => id.toString()) || [],
      paymentSourceIds: doc.paymentSourceIds?.map((id) => id.toString()) || [],
    }));
  }
}
