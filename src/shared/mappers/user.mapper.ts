import {
  Education,
  ProjectRoleType,
  Role,
  Social,
  User,
  UserHardSkill,
  UserSoftSkill,
} from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user.response-dto';
import { EducationMapper } from './education.mapper';
import { SocialMapper } from './social.mapper';
import { SoftSkillMapper } from './soft-skill.mapper';
import { HardSkillMapper } from './hard-skill.mapper';
import { UserWithPasswordResponseDto } from '../../users/dto/user-with-password.response-dto';

export class UserMapper {
  public static toResponse(
    user: User & {
      role: Role;
      educations: (Education & { specialization: ProjectRoleType })[];
      socials: Social[];
      softSkills: UserSoftSkill[];
      hardSkills: UserHardSkill[];
    },
    withPassword: boolean,
  ): UserResponseDto | UserWithPasswordResponseDto {
    const base = {
      id: user.id,
      googleId: user.googleId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      role: user.role,
      educations: user.educations.map((education) =>
        EducationMapper.toResponse(education),
      ),
      socials: user.socials.map((social) => SocialMapper.toResponse(social)),
      softSkills: user.softSkills.map((skill) =>
        SoftSkillMapper.toResponse(skill),
      ),
      hardSkills: user.hardSkills.map((skill) =>
        HardSkillMapper.toResponse(skill),
      ),
    };

    return withPassword
      ? {
          ...base,
          password: user.password,
        }
      : base;
  }
}
