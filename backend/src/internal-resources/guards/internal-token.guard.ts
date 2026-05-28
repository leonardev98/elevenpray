import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class InternalTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected =
      this.config.get<string>('FILEINGEST_WEBHOOK_TOKEN') ??
      this.config.get<string>('FILEINGEST_INTERNAL_TOKEN') ??
      '';
    if (!expected) {
      throw new UnauthorizedException('Webhook token is not configured');
    }
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.header('x-internal-token');
    if (!token || token !== expected) {
      throw new UnauthorizedException('Invalid internal token');
    }
    return true;
  }
}
