import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';

export const getMailerConfig = async (configService: ConfigService): Promise<MailerOptions> => {
  return {
    transport: {
      host: configService.get('SMTP_HOST'),
      port: configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASSWORD'),
      },
    },
    defaults: {
      from: `Verification <${configService.get('MAIL_FROM')}>`,
    },
  };
};
