import { Controller, Get, Req, Res } from '@nestjs/common';
import { CsrfService } from './csrf.service';
import { CsrfTokenResponseDto } from './dto/csrf-token.response-dto';
import { Request, Response } from 'express';

@Controller('csrf')
export class CsrfController {
  public constructor(private readonly csrfService: CsrfService) {}

  @Get('')
  public async getCsrfToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CsrfTokenResponseDto> {
    return this.csrfService.generateToken(req, res);
  }
}
