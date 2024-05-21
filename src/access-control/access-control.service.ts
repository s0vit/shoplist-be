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
    if (result) return result.allowed;
  }
  async create(allowed: AllowedUserDto, token: string): Promise<AccessControlDocument> {
    try {
      const result = await this.jwtService.verifyAsync(token, { secret: this.accessSecret });
      const accessControlInstance = new this.accessControlModel({
        userId: result.userId,
        allowed: allowed.allowedUsersId,
      });
      const createdAccess = await accessControlInstance.save();
      return createdAccess.toObject({ versionKey: false });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
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
  async delete(token: string = '') {
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
