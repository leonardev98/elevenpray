import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpsertStudentProfileDto } from './dto/upsert-student-profile.dto';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import type { PublicUser } from './public-user.interface';

export type { PublicUser } from './public-user.interface';

const SEED_EMAIL = 'admin@localhost';
const SEED_PASSWORD = 'admin';
const SEED_NAME = 'Admin';

interface CachedPublicUser {
  user: PublicUser;
  expiresAt: number;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly googleClient: OAuth2Client | null;
  private readonly googleClientId: string | undefined;
  private readonly userCache = new Map<string, CachedPublicUser>();
  private readonly userCacheTtlMs: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = this.googleClientId
      ? new OAuth2Client(this.googleClientId)
      : null;
    const ttl = Number(this.configService.get<string>('AUTH_USER_CACHE_TTL_MS'));
    this.userCacheTtlMs = Number.isFinite(ttl) && ttl > 0 ? ttl : 120_000;
  }

  invalidateUserCache(userId: string): void {
    this.userCache.delete(userId);
  }

  private cachePublicUser(user: PublicUser): PublicUser {
    this.userCache.set(user.id, {
      user,
      expiresAt: Date.now() + this.userCacheTtlMs,
    });
    return user;
  }

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
    let user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
    user = await this.ensureStudentOnboardingBackfill(user);
    const accessToken = this.jwtService.sign(this.payloadFrom(user));
    return { accessToken, user: this.toPublic(user) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: PublicUser }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await this.verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const synced = await this.ensureStudentOnboardingBackfill(user);
    const accessToken = this.jwtService.sign(this.payloadFrom(synced));
    return { accessToken, user: this.toPublic(synced) };
  }

  async loginWithGoogle(
    idToken: string,
  ): Promise<{ accessToken: string; user: PublicUser }> {
    if (!this.googleClient || !this.googleClientId) {
      throw new InternalServerErrorException(
        'Google login is not configured on this server',
      );
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google ID token');
    }
    if (payload.email_verified === false) {
      throw new UnauthorizedException('Google email is not verified');
    }

    const sub = payload.sub;
    const email = payload.email;
    const name =
      payload.name?.trim() || payload.given_name?.trim() || email.split('@')[0];
    const picture = payload.picture ?? null;

    let user = await this.usersService.findByGoogleSub(sub);

    if (user) {
      // Cuenta ya enlazada: mantenemos `name` sincronizado con Google y
      // refrescamos avatar solo si el usuario no subió uno custom (las fotos
      // custom viven en S3, las de Google contienen "googleusercontent.com").
      const updates: { name?: string; avatarUrl?: string | null } = {};
      if (name && user.name !== name) updates.name = name;
      const hasCustomAvatar = !!(
        user.avatarUrl && !user.avatarUrl.includes('googleusercontent.com')
      );
      if (!hasCustomAvatar && picture && user.avatarUrl !== picture) {
        updates.avatarUrl = picture;
      }
      if (Object.keys(updates).length > 0) {
        this.invalidateUserCache(user.id);
        user = await this.usersService.update(user.id, updates);
      }
    } else {
      const existingByEmail = await this.usersService.findByEmail(email);
      if (existingByEmail) {
        // Primer enlace: sincronizamos nombre desde Google y preservamos
        // avatar custom (si existe).
        const hasCustomAvatar = !!(
          existingByEmail.avatarUrl &&
          !existingByEmail.avatarUrl.includes('googleusercontent.com')
        );
        this.invalidateUserCache(existingByEmail.id);
        user = await this.usersService.update(existingByEmail.id, {
          googleSub: sub,
          name,
          avatarUrl: hasCustomAvatar ? existingByEmail.avatarUrl : picture,
        });
      } else {
        user = await this.usersService.create({
          email,
          name,
          passwordHash: null,
          googleSub: sub,
          avatarUrl: picture,
        });
      }
    }

    user = await this.ensureStudentOnboardingBackfill(user);
    const accessToken = this.jwtService.sign(this.payloadFrom(user));
    return { accessToken, user: this.toPublic(user) };
  }

  async validatePayload(
    payload: JwtPayload,
    options?: { bypassCache?: boolean },
  ): Promise<PublicUser | null> {
    if (!options?.bypassCache) {
      const cached = this.userCache.get(payload.sub);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.user;
      }
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      this.userCache.delete(payload.sub);
      return null;
    }
    const synced = await this.ensureStudentOnboardingBackfill(user);
    return this.cachePublicUser(this.toPublic(synced));
  }

  async getPublicUserById(userId: string): Promise<PublicUser | null> {
    const user = await this.usersService.findById(userId);
    if (!user) return null;
    const synced = await this.ensureStudentOnboardingBackfill(user);
    return this.cachePublicUser(this.toPublic(synced));
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    const updates: { name?: string; email?: string; avatarUrl?: string | null } = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.avatarUrl !== undefined) updates.avatarUrl = dto.avatarUrl ?? null;
    if (Object.keys(updates).length === 0) {
      const user = await this.usersService.findById(userId);
      if (!user) throw new UnauthorizedException('User not found');
      return this.cachePublicUser(this.toPublic(user));
    }
    this.invalidateUserCache(userId);
    await this.usersService.update(userId, updates);
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.cachePublicUser(this.toPublic(user));
  }

  async upsertStudentProfile(
    userId: string,
    dto: UpsertStudentProfileDto,
  ): Promise<PublicUser> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const updates: {
      name?: string;
      studentUniversity: string;
      studentCareer: string;
      studentAcademicCycle: string;
      studentOnboardingCompletedAt?: Date;
    } = {
      studentUniversity: dto.university.trim(),
      studentCareer: dto.career.trim(),
      studentAcademicCycle: dto.cycle.trim(),
    };

    if (dto.name !== undefined) updates.name = dto.name.trim();
    if (!user.studentOnboardingCompletedAt) {
      updates.studentOnboardingCompletedAt = new Date();
    }

    this.invalidateUserCache(userId);
    await this.usersService.update(userId, updates);
    const updated = await this.usersService.findById(userId);
    if (!updated) throw new UnauthorizedException('User not found');
    return this.cachePublicUser(this.toPublic(updated));
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');
    const valid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException('Invalid current password');
    const passwordHash = await this.hashPassword(newPassword);
    this.invalidateUserCache(userId);
    await this.usersService.update(userId, { passwordHash });
  }

  private payloadFrom(user: User): JwtPayload {
    return { sub: user.id, email: user.email };
  }

  private hasCompleteStudentProfile(user: User): boolean {
    return !!(
      user.studentUniversity?.trim() &&
      user.studentCareer?.trim() &&
      user.studentAcademicCycle?.trim()
    );
  }

  /** Usuarios con perfil académico guardado pero sin marca de fecha (datos legacy). */
  private async ensureStudentOnboardingBackfill(user: User): Promise<User> {
    if (
      user.studentOnboardingCompletedAt ||
      !this.hasCompleteStudentProfile(user)
    ) {
      return user;
    }
    this.invalidateUserCache(user.id);
    return this.usersService.update(user.id, {
      studentOnboardingCompletedAt: new Date(),
    });
  }

  private toPublic(user: User): PublicUser {
    const hasStudentData = this.hasCompleteStudentProfile(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role ?? 'user',
      avatarUrl: user.avatarUrl ?? null,
      studentProfile: hasStudentData
        ? {
            university: user.studentUniversity!.trim(),
            career: user.studentCareer!.trim(),
            cycle: user.studentAcademicCycle!.trim(),
          }
        : null,
      studentOnboardingCompleted:
        !!user.studentOnboardingCompletedAt || hasStudentData,
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
