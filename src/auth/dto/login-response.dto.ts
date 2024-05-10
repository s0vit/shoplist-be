import { UserDocument } from '../models/user.model';

export class LoginResponseDto {
  email: string;
  login: string;
  isVerified: boolean;
  accessToken: string;

  constructor(user: UserDocument) {
    this.email = user.email;
    this.login = user.login;
    this.isVerified = user.isVerified;
    this.accessToken = user.accessToken;
  }
}
