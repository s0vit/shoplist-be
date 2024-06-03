import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { AccessControl } from './models/access-control.model';
import { AccessControlInputDto } from './dto/access-control-input.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ACCESS_CONTROL_ERROR } from './constants/access-control-error.enum';
import { AccessJwtGuard } from '../auth/guards/access-jwt.guard';
import { AccessControlOutputDto } from './dto/access-control-output.dto';

@UseGuards(AccessJwtGuard)
@Injectable()
export class AccessControlService {
  constructor(
    @InjectModel(AccessControl.name)
    private readonly accessControlModel: Model<AccessControl>,
  ) {}

  async getAll(userId: string): Promise<AccessControlOutputDto[]> {
    return this.accessControlModel.find({ ownerId: userId }).select('-__v').lean();
  }

  async _getAllowedExpensesId(ownerId: string, participantID: string): Promise<string[]> {
    const result = await this.accessControlModel.findOne({ ownerId, sharedWith: participantID });
    if (result) return result.expenseIds;
  }

  async create(userId: string, dto: AccessControlInputDto): Promise<AccessControlOutputDto> {
    if (dto.sharedWith.includes(userId)) {
      throw new ForbiddenException(ACCESS_CONTROL_ERROR.OWN_ACCESS_ERROR);
    }
    try {
      const accessControl = new this.accessControlModel({ ownerId: userId, ...dto });
      const result = await accessControl.save();
      return result.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(ACCESS_CONTROL_ERROR.CREATE_ACCESS_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(userId: string, accessId: string, dto: AccessControlInputDto): Promise<AccessControlOutputDto> {
    if (dto.sharedWith?.includes(userId)) {
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
}
