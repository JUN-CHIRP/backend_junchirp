import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { CsrfService } from './csrf.service';
import { Request, Response } from 'express';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';

@Controller('csrf')
export class CsrfController {
  public constructor(private readonly csrfService: CsrfService) {}

  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('')
  public async getCsrfToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    return this.csrfService.generateToken(req, res);
  }
}
