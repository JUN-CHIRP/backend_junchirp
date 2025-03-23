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
  @IsEmail({}, { message: 'Email is incorrect' })
  @Matches(/^(?!.*[а-яА-ЯіІєЄїЇ])(?!.*\.ru$)/, {
    message: 'Invalid email format or contains a restricted domain',
  })
  public readonly email: string;

  @ApiProperty({ example: 'token', description: 'Confirmation token' })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Must be a string' })
  public readonly token: string;
}
