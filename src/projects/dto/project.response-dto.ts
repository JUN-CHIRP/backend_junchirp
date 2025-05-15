import { ApiProperty } from '@nestjs/swagger';
import { DocumentResponseDto } from '../../documents/dto/document.response-dto';
import { ProjectCardResponseDto } from './project-card.response-dto';

export class ProjectResponseDto extends ProjectCardResponseDto {
  @ApiProperty({
    example: 'https://discord.gg/qwertyuiop',
    description: 'Discord url',
  })
  public readonly discordUrl: string;

  @ApiProperty({
    example: 'logo-url',
    description: 'Project logo url',
  })
  public readonly logoUrl: string;

  @ApiProperty({ type: () => [DocumentResponseDto] })
  public readonly documents: DocumentResponseDto[];
}
