import { Education } from '@prisma/client';
import { EducationResponseDto } from '../../educations/dto/education.response-dto';

export class EducationMapper {
  public static toResponse(education: Education): EducationResponseDto {
    return {
      id: education.id,
      institution: education.institution,
      specialization: education.specialization,
    };
  }
}
