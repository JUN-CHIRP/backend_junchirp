import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({ example: 'token', description: 'Confirmation token' })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Must be a string' })
  public readonly token: string;
}
