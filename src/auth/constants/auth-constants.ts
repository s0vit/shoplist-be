export const COOKIE_SETTINGS = {
  ACCESS_TOKEN: {
    httpOnly: true,
    secure: false, // ToDo: On production change to true
    maxAge: 2 * 60 * 60 * 1000, // 2 hour
  },
};
