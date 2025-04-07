import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { IsValidSocialNetworkUrl } from '../../shared/validators/is-valid-social-network-url.validator';

export class CreateEducationDto {
  @ApiProperty({
    example: 'Ivan Franko National University of Lviv',
    description: 'Name of the educational institution',
  })
  @IsString({ message: 'Must be a string' })
  @Length(2, 100, { message: 'Must be between 2 and 100 characters' })
  @Matches(/^[A-Za-zА-Яа-яІіЇїЄєҐґ0-9 .'-]{2,100}$/, {
    message: 'Institution name is incorrect',
  })
  @IsNotEmpty({ message: 'Institution name is required' })
  public readonly institution: string;

  @ApiProperty({ example: 'Mathematics', description: 'Specialization' })
  @IsString({ message: 'Must be a string' })
  @Length(2, 100, { message: 'Must be between 2 and 100 characters' })
  @Matches(/^[A-Za-zА-Яа-яІіЇїЄєҐґ0-9 .'-]{2,100}$/, {
    message: 'Specialization name is incorrect',
  })
  @IsNotEmpty({ message: 'Specialization name is required' })
  @IsValidSocialNetworkUrl()
  public readonly specialization: string;
}
