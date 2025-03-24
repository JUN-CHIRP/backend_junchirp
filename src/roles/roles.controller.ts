import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  public constructor(private rolesService: RolesService) {}
}
