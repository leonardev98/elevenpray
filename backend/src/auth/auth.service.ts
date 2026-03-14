import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

const SEED_EMAIL = 'admin@localhost';
const SEED_PASSWORD = 'admin';
const SEED_NAME = 'Admin';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.usersService.findByEmail(SEED_EMAIL);
    if (existing) return;
    const passwordHash = await this.hashPassword(SEED_PASSWORD);
    await this.usersService.create({
      email: SEED_EMAIL,
      name: SEED_NAME,
      passwordHash,
    });
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: PublicUser }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
    const accessToken = this.jwtService.sign(this.payloadFrom(user));
    return { accessToken, user: this.toPublic(user) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: PublicUser }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await this.verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.jwtService.sign(this.payloadFrom(user));
    return { accessToken, user: this.toPublic(user) };
  }

  async validatePayload(payload: JwtPayload): Promise<PublicUser | null> {
    const user = await this.usersService.findById(payload.sub);
    return user ? this.toPublic(user) : null;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    const updates: { name?: string; email?: string } = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.email !== undefined) updates.email = dto.email;
    if (Object.keys(updates).length === 0) {
      const user = await this.usersService.findById(userId);
      if (!user) throw new UnauthorizedException('User not found');
      return this.toPublic(user);
    }
    await this.usersService.update(userId, updates);
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.toPublic(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user)
      throw new UnauthorizedException('Invalid credentials');
    const valid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException('Invalid current password');
    const passwordHash = await this.hashPassword(newPassword);
    await this.usersService.update(userId, { passwordHash });
  }

  private payloadFrom(user: User): JwtPayload {
    return { sub: user.id, email: user.email };
  }

  private toPublic(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role ?? 'user',
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(password).digest('hex');
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const h = await this.hashPassword(password);
    return h === hash;
  }
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'platform_admin';
}
