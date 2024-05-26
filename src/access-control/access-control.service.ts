import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AccessControl, AccessControlDocument } from './models/access-control.model';
import { AllowedUserDto } from './dto/allowed-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ACCESS_CONTROL_ERROR } from './constants/access-control-error.enum';
import { TokenPayload } from 'src/common/interfaces/token.interface';

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

  async getAllowed(userId: string, currentUserID: string) {
    const result = await this.accessControlModel.findOne({ ownerId: userId, sharedWith: currentUserID }).exec();
    if (result) return result.expenseIds;
  }
  async create(allowed: AllowedUserDto, token: string): Promise<AccessControlDocument> {
    let currentUser: { userId: string; email: string };
    try {
      currentUser = this.jwtService.verify<TokenPayload>(token, { secret: this.accessSecret });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
    }
    if (currentUser.userId === allowed.sharedWith) {
      throw new ForbiddenException(ACCESS_CONTROL_ERROR.OWN_ACCESS_ERROR);
    }
    try {
      const accessControl = await this.accessControlModel.findOneAndUpdate(
        { ownerId: currentUser.userId, sharedWith: allowed.sharedWith },
        { $addToSet: { expenseIds: { $each: allowed.expenseIds } } },
        { upsert: true, new: true }, // upsert: true creates a new document if it doesn't exist
      );
      return accessControl.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(ACCESS_CONTROL_ERROR.CREATE_ACCESS_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async update(token: string) {
    try {
      const result = await this.jwtService.verifyAsync<TokenPayload>(token, { secret: this.accessSecret });
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
    // when delete all expenseIds, need to delete record
    try {
      const result = await this.jwtService.verifyAsync<TokenPayload>(token, { secret: this.accessSecret });
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
