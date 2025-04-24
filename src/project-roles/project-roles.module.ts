import { Module } from '@nestjs/common';
import { ProjectRolesService } from './project-roles.service';
import { ProjectRolesController } from './project-roles.controller';

@Module({
  controllers: [ProjectRolesController],
  providers: [ProjectRolesService],
  exports: [ProjectRolesService],
})
export class ProjectRolesModule {}
