import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    type: String,
    example: 'email@mail.com',
    description: 'Email',
  })
  @IsString({
    message: 'Email is required',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    example: 'q1we5?!ER234',
    description: 'Password',
    minLength: 6,
  })
  @MinLength(6, {
    message: 'The password must contain at least 6 characters',
  })
  @IsString({
    message: 'Password is required',
  })
  password: string;
}
