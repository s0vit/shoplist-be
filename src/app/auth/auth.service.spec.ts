import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ERROR_AUTH } from './constants/auth-error.enum';

describe('AuthService - sendTestEmail', () => {
  const emailService = {
    sendMail: jest.fn(),
  };

  const configService = {
    get: jest.fn().mockReturnValue('test'),
  };

  const utilsService = {
    createCaseInsensitiveRegexFromString: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    emailService.sendMail.mockReset();
    service = new AuthService(
      {} as any,
      {} as any,
      emailService as any,
      configService as any,
      {} as any,
      {} as any,
      utilsService as any,
    );
  });

  it('should send a test email via EmailService with default content', async () => {
    emailService.sendMail.mockResolvedValue(undefined);

    await service.sendTestEmail({ email: 'test@example.com' });

    expect(emailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'ShopList email test',
        text: 'ShopList Resend integration is working.',
        html: '<p>ShopList Resend integration is working.</p>',
      }),
    );
  });

  it('should respect custom text and html when provided', async () => {
    emailService.sendMail.mockResolvedValue(undefined);

    await service.sendTestEmail({
      email: 'test@example.com',
      text: 'Custom text',
      html: '<p>Custom <strong>HTML</strong></p>',
    });

    expect(emailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'ShopList email test',
        text: 'Custom text',
        html: '<p>Custom <strong>HTML</strong></p>',
      }),
    );
  });

  it('should wrap errors from EmailService in HttpException', async () => {
    emailService.sendMail.mockRejectedValue(new Error('boom'));

    await expect(service.sendTestEmail({ email: 'test@example.com' })).rejects.toEqual(
      new HttpException(ERROR_AUTH.SEND_EMAIL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR),
    );
  });
});
