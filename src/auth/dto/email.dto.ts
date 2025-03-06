import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class EmailDto {
  @ApiProperty({ example: 'email@mail.com', description: 'Email' })
  @IsString({ message: 'Must be a string' })
  @Length(7, 254, { message: 'Must be between 7 and 254 characters' })
  @Matches(
    /^(?!.*\.ru$)([a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+)*)@([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    { message: 'Invalid email format or contains a restricted domain' },
  )
  public readonly email: string;
}
