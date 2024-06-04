import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { FindByEmailOutputDto } from './dto/find-by-email-output.dto';
import { GetUserByEmailSw } from './decorators/get-user-by-email-sw.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @GetUserByEmailSw()
  @Get(':email')
  async get(@Param('email') email: string): Promise<FindByEmailOutputDto[]> {
    return this.userService.findByEmail(email);
  }
}
