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

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: 'user' | 'platform_admin';
  }): Promise<User> {
    const user = this.userRepository.create({
      ...data,
      role: data.role ?? 'user',
    });
    return this.userRepository.save(user);
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string;
      avatarUrl?: string | null;
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

    return this.userRepository.save(user);
  }
}
