export const COOKIE_SETTINGS = {
  ACCESS_TOKEN: {
    httpOnly: true,
    secure: true,
    maxAge: 2 * 60 * 60 * 1000, // 2 hour
  },
};
