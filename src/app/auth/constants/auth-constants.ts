import { CookieOptions } from 'express';

type TCookieSettings = {
  ACCESS_TOKEN: CookieOptions;
};

export const COOKIE_SETTINGS: TCookieSettings = {
  ACCESS_TOKEN: {
    httpOnly: true,
    secure: true,
    maxAge: 2 * 60 * 60 * 1000, // 2 hour
    sameSite: 'none',
  },
};
