import { Controller, Get, Req, Res } from '@nestjs/common';
import { CsrfService } from './csrf.service';
import { CsrfTokenResponseDto } from './dto/csrf-token.response-dto';
import { Request, Response } from 'express';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('csrf')
export class CsrfController {
  public constructor(private readonly csrfService: CsrfService) {}

  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiOkResponse({ type: CsrfTokenResponseDto })
  @Get('')
  public async getCsrfToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CsrfTokenResponseDto> {
    return this.csrfService.generateToken(req, res);
  }
}
