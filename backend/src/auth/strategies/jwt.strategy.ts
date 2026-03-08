import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AuthService, PublicUser } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<PublicUser> {
    this.logger.debug(`JWT validate: sub=${payload.sub} email=${payload.email}`);
    const user = await this.authService.validatePayload(payload);
    if (!user) {
      this.logger.warn(`JWT 401: user not found in DB for sub=${payload.sub}`);
      throw new UnauthorizedException();
    }
    return user;
  }
}
