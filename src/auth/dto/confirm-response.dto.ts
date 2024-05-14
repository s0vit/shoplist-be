import { UserDocument } from '../models/user.model';

export class ConfirmResponseDto {
  email: string;
  login: string;
  createdAt: Date;

  constructor(user: UserDocument) {
    this.email = user.email;
    this.login = user.login;
    this.createdAt = user.createdAt;
  }
}
