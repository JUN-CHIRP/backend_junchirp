import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { IsPasswordNotContainName } from '../../shared/validators/is-password-not-contain-name.validator';
import { IsPasswordInBlackList } from '../../shared/validators/is-in-black-list.validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'q1we5?!ER234', description: 'Password' })
  @IsString({ message: 'Must be a string' })
  @Length(8, 20, { message: 'Must be between 8 and 20 characters' })
  @Matches(
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\\\-./:;<=>?@[\]^_`{|}~])\S{8,20}$/,
    { message: 'Password is incorrect' },
  )
  @IsPasswordNotContainName()
  @IsPasswordInBlackList()
  @IsNotEmpty({ message: 'Password is required' })
  public readonly password: string;

  @ApiProperty({ example: 'token', description: 'Reset password token' })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Must be a string' })
  public readonly token: string;
}
