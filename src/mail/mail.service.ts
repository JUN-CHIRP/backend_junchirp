import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  public constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  public async sendMail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `Support Team <${this.configService.get<string>('EMAIL_USER')}>`,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation-code',
      context: {
        code: code,
      },
    });
  }
}
