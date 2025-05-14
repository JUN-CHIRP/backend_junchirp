import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProjectRolesModule } from '../project-roles/project-roles.module';
import { ParticipationsModule } from '../participations/participations.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [
    CloudinaryModule,
    ProjectRolesModule,
    ParticipationsModule,
    DiscordModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
