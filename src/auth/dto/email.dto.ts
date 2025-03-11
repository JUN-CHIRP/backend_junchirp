import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @ApiProperty({ example: 'email@mail.com', description: 'Email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  public readonly email: string;
}
