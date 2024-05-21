export const COOKIE_SETTINGS = {
  ACCESS_TOKEN: {
    httpOnly: true,
    secure: false, // ToDo: On production change to true
    maxAge: 72e5, // 2 hour
  },
};
