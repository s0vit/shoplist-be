import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
  isVerified: boolean;
}

export interface CustomRequest extends Request {
  user: TokenPayload;
}

export interface GoogleRequest extends Request {
  user: GoogleProfile;
}

export interface GoogleProfile {
  email: string;
  accessToken: string;
  refreshToken: string;
}

export type GoogleResponse = {
  id?: string;
  displayName?: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  emails?: {
    value?: string;
    verified?: boolean;
  }[];
  photos?: {
    value?: string;
  }[];
  provider?: string;
  _raw?: string;
  _json?: {
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    email?: string;
    email_verified?: boolean;
  };
};
