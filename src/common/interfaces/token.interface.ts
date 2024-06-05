import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
  isVerified: boolean;
}

export interface CustomRequest extends Request {
  user: TokenPayload;
}
