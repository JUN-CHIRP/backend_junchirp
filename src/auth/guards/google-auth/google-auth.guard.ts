import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  public constructor() {
    super({
      accessType: 'offline',
      prompt: 'select_account',
    });
  }
}
