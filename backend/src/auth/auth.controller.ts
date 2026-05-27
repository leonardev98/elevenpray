import { Controller, Post, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { PublicUser } from './public-user.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfilePhotoUploadUrlDto } from './dto/profile-photo-upload-url.dto';
import { UpsertStudentProfileDto } from './dto/upsert-student-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { S3Service } from '../s3/s3.service';
import { randomUUID } from 'crypto';

const CONTENT_TYPE_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ): Promise<{ accessToken: string; user: PublicUser }> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
  ): Promise<{ accessToken: string; user: PublicUser }> {
    return this.authService.login(dto);
  }

  @Post('google')
  async loginWithGoogle(
    @Body() dto: GoogleLoginDto,
  ): Promise<{ accessToken: string; user: PublicUser }> {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: PublicUser): Promise<PublicUser> {
    return user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: PublicUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ user: PublicUser }> {
    const updated = await this.authService.updateProfile(user.id, dto);
    return { user: updated };
  }

  @Patch('student-profile')
  @UseGuards(JwtAuthGuard)
  async upsertStudentProfile(
    @CurrentUser() user: PublicUser,
    @Body() dto: UpsertStudentProfileDto,
  ): Promise<{ user: PublicUser }> {
    const updated = await this.authService.upsertStudentProfile(user.id, dto);
    return { user: updated };
  }

  @Post('profile-photo/upload-url')
  @UseGuards(JwtAuthGuard)
  async getProfilePhotoUploadUrl(
    @CurrentUser() user: PublicUser,
    @Body() dto: ProfilePhotoUploadUrlDto,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    const ext = CONTENT_TYPE_EXT[dto.contentType] ?? 'jpg';
    const key = `profile/${user.id}/${randomUUID()}.${ext}`;
    return this.s3Service.getPresignedUploadUrl(key, dto.contentType);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: PublicUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    await this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
    return { success: true };
  }
}
