import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    type: String,
    example: 'email@mail.com',
    description: 'Email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is incorrect' })
  @Matches(/^(?!.*[а-яА-ЯіІєЄїЇ])(?!.*\.ru$)/, {
    message: 'Invalid email format or contains a restricted domain',
  })
  email: string;

  @ApiProperty({
    type: String,
    example: 'q1we5?!ER234',
    description: 'Password',
    minLength: 6,
    maxLength: 20,
  })
  @Length(8, 20, { message: 'Must be between 8 and 32 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
