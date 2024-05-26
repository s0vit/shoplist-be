import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface CustomRequest extends Request {
  user: TokenPayload;
}
