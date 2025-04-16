import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Crud } from '@ackplus/nest-crud';

@ApiTags('users')
@Controller('users')
@Crud({
  name: 'users',
  entity: User,
  path: 'users',
  softDelete: true,
})
export class UserController {
  constructor(private readonly service: UserService) { }

}
