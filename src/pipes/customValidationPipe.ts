import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

export const customValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors: ValidationError[]) => {
    const customErrors: CustomErrors = {};

    errors.forEach((e) => {
      if (!e.constraints) {
        customErrors['unknown']
          ? customErrors['unknown'].push(e.property)
          : (customErrors['unknown'] = ['unknown error']);
        return;
      }

      const constraintKeys = Object.keys(e.constraints);
      constraintKeys.forEach((cKey) => {
        const msg = e.constraints![cKey];
        customErrors[e.property] ? customErrors[e.property].push(msg) : (customErrors[e.property] = [msg]);
      });
    });

    throw new BadRequestException(customErrors);
  },
});

type CustomErrors = Record<string, string[]>;
