import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({ example: 'email@mail.com', description: 'Email' })
  @IsString({ message: 'Must be a string' })
  @Length(7, 254, { message: 'Must be between 7 and 254 characters' })
  @Matches(
    /^(?!.*\.ru$)([a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+)*)@([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    { message: 'Invalid email format or contains a restricted domain' },
  )
  public readonly email: string;

  @ApiProperty({ example: '527249', description: 'Confirmation code' })
  @IsString({ message: 'Must be a string' })
  @Length(6, 6, { message: 'Must contain 6 characters' })
  @Matches(/^d{6}$/, { message: 'Must contain 6 digits' })
  public readonly code: string;
}
