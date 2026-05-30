import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByGoogleSub(googleSub: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleSub } });
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash?: string | null;
    role?: 'user' | 'platform_admin';
    googleSub?: string | null;
    avatarUrl?: string | null;
  }): Promise<User> {
    const user = this.userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash ?? null,
      role: data.role ?? 'user',
      googleSub: data.googleSub ?? null,
      avatarUrl: data.avatarUrl ?? null,
    });
    return this.userRepository.save(user);
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string | null;
      avatarUrl?: string | null;
      googleSub?: string | null;
      studentUniversity?: string | null;
      studentCareer?: string | null;
      studentAcademicCycle?: string | null;
      studentOnboardingCompletedAt?: Date | null;
      studentProgramType?: 'tecnico' | 'universidad' | null;
      curriculumTotalCycles?: number | null;
    },
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null as unknown as User;

    if (data.email !== undefined) {
      const existing = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use');
      }
      user.email = data.email;
    }
    if (data.name !== undefined) user.name = data.name;
    if (data.passwordHash !== undefined) user.passwordHash = data.passwordHash;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    if (data.googleSub !== undefined) user.googleSub = data.googleSub;
    if (data.studentUniversity !== undefined)
      user.studentUniversity = data.studentUniversity;
    if (data.studentCareer !== undefined) user.studentCareer = data.studentCareer;
    if (data.studentAcademicCycle !== undefined)
      user.studentAcademicCycle = data.studentAcademicCycle;
    if (data.studentOnboardingCompletedAt !== undefined)
      user.studentOnboardingCompletedAt = data.studentOnboardingCompletedAt;
    if (data.studentProgramType !== undefined)
      user.studentProgramType = data.studentProgramType;
    if (data.curriculumTotalCycles !== undefined)
      user.curriculumTotalCycles = data.curriculumTotalCycles;

    return this.userRepository.save(user);
  }
}
