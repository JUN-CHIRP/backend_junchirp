import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from '../../roles/dto/role.response-dto';

export class UserResponseDto {
  @ApiProperty({
    example: 'a4d4eb0c-1a10-455e-b9e9-1af147a77762',
    description: 'Unique identifier',
  })
  public readonly id: string;

  @ApiProperty({ example: 'email@mail.com', description: 'Email' })
  public readonly email: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  public readonly firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  public readonly lastName: string;

  @ApiProperty({ example: 'avatar-url', description: 'Avatar URL' })
  public readonly avatarUrl: string | null;

  @ApiProperty({ example: false, description: `Is user's email verified?` })
  public readonly isVerified: boolean;

  @ApiProperty({
    example: '2025-03-10T12:43:26.437Z',
    description: 'Date of profile creation',
  })
  public readonly createdAt: Date;

  @ApiProperty({
    example: 'd6686d4c-9485-4256-8410-193860442a86',
    description: 'Role identifier',
  })
  public readonly roleId: string;

  @ApiProperty({ type: () => RoleResponseDto })
  public readonly role: RoleResponseDto;
}
