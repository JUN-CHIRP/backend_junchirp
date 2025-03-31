import { Injectable } from '@nestjs/common';
import {
  doubleCsrf,
  DoubleCsrfUtilities,
} from 'csrf-csrf';
import { CsrfTokenResponseDto } from './dto/csrf-token.response-dto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CsrfService {
  private readonly csrf: DoubleCsrfUtilities;

  public constructor() {
    this.csrf = doubleCsrf({
      getSecret: () => process.env.CSRF_SECRET ?? 'default_secret',
      getTokenFromRequest: (req) => req.headers['x-csrf-token'],
      cookieName:
        process.env.NODE_ENV === 'production'
          ? '__Host-prod.x-csrf-token'
          : '_csrf',
      cookieOptions: {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      },
    });
  }

  public doubleCsrfProtection(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    return this.csrf.doubleCsrfProtection(req, res, next);
  }

  public generateToken(req: Request, res: Response): CsrfTokenResponseDto {
    return { csrfToken: this.csrf.generateToken(req, res) };
  }
}
