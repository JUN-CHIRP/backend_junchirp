import { forwardRef, Module } from '@nestjs/common';
import { ProjectRolesService } from './project-roles.service';
import { ProjectRolesController } from './project-roles.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [ProjectRolesController],
  providers: [ProjectRolesService],
  exports: [ProjectRolesService],
})
export class ProjectRolesModule {}
