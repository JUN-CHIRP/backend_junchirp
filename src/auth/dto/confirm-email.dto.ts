import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({ example: 'email@mail.com', description: 'Email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  public readonly email: string;

  @ApiProperty({ example: '527249', description: 'Confirmation code' })
  @IsString({ message: 'Must be a string' })
  @Length(6, 6, { message: 'Must contain 6 characters' })
  @Matches(/^d{6}$/, { message: 'Must contain 6 digits' })
  public readonly code: string;
}
