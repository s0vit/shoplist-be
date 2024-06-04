import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenPayload } from '../common/interfaces/token.interface';
import { UserService } from '../app/user/user.service';

@Injectable()
export class IsUserVerifiedGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: TokenPayload = request.user;

    const { userId } = user;

    const isVerified = await this.userService.isUserVerified(userId);

    if (!isVerified) {
      throw new UnauthorizedException('User is not verified');
    }

    return true;
  }
}
