import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  public constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  public async sendVerificationMail(email: string, url: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `Support Team <${this.configService.get<string>('EMAIL_USER')}>`,
      subject: 'Підтвердження електронної пошти',
      template: './confirmation-email',
      context: { url },
    });
  }

  public async sendResetPasswordMail(
    email: string,
    url: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `Support Team <${this.configService.get<string>('EMAIL_USER')}>`,
      subject: 'Твоє посилання для відновлення паролю',
      template: './reset-password-email',
      context: { url },
    });
  }
}
