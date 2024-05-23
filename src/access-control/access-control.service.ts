import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AccessControl, AccessControlDocument } from './models/access-control.model';
import { AllowedUserDto } from './dto/allowed-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ACCESS_CONTROL_ERROR } from './constants/access-control-error.enum';

@Injectable()
export class AccessControlService {
  private readonly accessSecret: string;
  constructor(
    @InjectModel(AccessControl.name)
    private readonly accessControlModel: Model<AccessControl>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('ACCESS_TOKEN_KEY');
  }

  async getAllowed(userId: string) {
    const result = await this.accessControlModel.findOne({ userId }).exec();
    if (result) return result.expenseIds;
  }
  async create(allowed: AllowedUserDto, token: string): Promise<AccessControlDocument> {
    let currentUser: { userId: string; email: string };
    try {
      currentUser = this.jwtService.verify<{ userId: string; email: string }>(token, { secret: this.accessSecret });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
    }

    const isExist = await this.accessControlModel
      .findOne({ ownerId: currentUser.userId, sharedWith: allowed.sharedWith })
      .exec();
    if (isExist) {
      const updatedAccess = await this.accessControlModel.findOneAndUpdate(
        { ownerId: currentUser.userId, sharedWith: allowed.sharedWith },
        // add new expenseIds to accessControlModel, excluding duplicate
        { $addToSet: { expenseIds: { $each: allowed.expenseIds } } },
        { new: true },
      );
      return updatedAccess.toObject({ versionKey: false });
    }
    const accessControlInstance = new this.accessControlModel({
      ownerId: currentUser.userId, // owner who shares
      sharedWith: allowed.sharedWith, // permitted user who gets access
      expenseIds: allowed.expenseIds, // permitted expensesIds
    });
    try {
      const createdAccess = await accessControlInstance.save();
      return createdAccess.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(ACCESS_CONTROL_ERROR.CREATE_ACCESS_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async update(token: string) {
    try {
      const result = await this.jwtService.verifyAsync(token, { secret: this.accessSecret });
      return result;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(ACCESS_CONTROL_ERROR.UPDATE_ACCESS_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async delete(accessId: string, token: string) {
    try {
      const result = await this.jwtService.verifyAsync(token, { secret: this.accessSecret });
      return result;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(ACCESS_CONTROL_ERROR.DELETE_ACCESS_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
