import { BadRequestException, ValidationPipe } from '@nestjs/common';

export const customValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors) => {
    const customErrors: CustomErrors = [];

    errors.forEach((e) => {
      if (!e.constraints) {
        customErrors.push({ key: e.property, message: 'Unknown error' });
        return;
      }
      const constraintKeys = Object.keys(e.constraints);

      constraintKeys.forEach((cKey) => {
        const msg = e.constraints![cKey];

        customErrors.push({ key: e.property, message: msg });
      });
    });
    throw new BadRequestException(customErrors);
  },
});

type CustomErrors = { key: string; message: string }[];
