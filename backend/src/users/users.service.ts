import { Injectable } from '@nestjs/common';
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
}
