import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

import { IsPasswordNotContainName } from '../../shared/validators/is-password-not-contain-name.validator';

export class CreateUserDto {
  @ApiProperty({ example: 'email@mail.com', description: 'Email' })
  @IsString({ message: 'Must be a string' })
  @Length(7, 254, { message: 'Must be between 7 and 254 characters' })
  @Matches(
    /^(?!.*\.ru$)([a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+)*)@([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    { message: 'Invalid email format or contains a restricted domain' },
  )
  public readonly email: string;

  @ApiProperty({ example: 'q1we5?!ER234', description: 'Password' })
  @IsString({ message: 'Must be a string' })
  @Length(8, 20, { message: 'Must be between 8 and 32 characters' })
  @Matches(
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\\\-./:;<=>?@[\]^_`{|}~])\S{8,20}$/,
    { message: 'Password is incorrect' },
  )
  @IsPasswordNotContainName()
  public readonly password: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString({ message: 'Must be a string' })
  @Length(2, 50, { message: 'Must be between 2 and 50 characters' })
  @Matches(/^[a-zA-Zа-яА-ЯґҐїЇєЄ' -]{2,50}$/, {
    message: 'First name is incorrect',
  })
  @IsNotEmpty({ message: 'Must be a not empty string' })
  public readonly firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString({ message: 'Must be a string' })
  @Length(2, 50, { message: 'Must be between 2 and 50 characters' })
  @Matches(/^[a-zA-Zа-яА-ЯґҐїЇєЄ' -]{2,50}$/, {
    message: 'First name is incorrect',
  })
  @IsNotEmpty({ message: 'Must be a not empty string' })
  public readonly lastName: string;
}
