import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from './entities/routine.entity';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/create-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
  ) {}

  async findAllByUserId(userId: string): Promise<Routine[]> {
    return this.routineRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Routine> {
    const routine = await this.routineRepository.findOne({ where: { id } });
    if (!routine) throw new NotFoundException('Routine not found');
    if (routine.userId !== userId) throw new ForbiddenException();
    return routine;
  }

  async create(userId: string, dto: CreateRoutineDto): Promise<Routine> {
    const routine = this.routineRepository.create({
      userId,
      weekLabel: dto.weekLabel,
      year: dto.year,
      weekNumber: dto.weekNumber,
      days: dto.days ?? {},
    });
    return this.routineRepository.save(routine);
  }

  async update(id: string, userId: string, dto: UpdateRoutineDto): Promise<Routine> {
    const routine = await this.findOne(id, userId);
    if (dto.weekLabel !== undefined) routine.weekLabel = dto.weekLabel;
    if (dto.year !== undefined) routine.year = dto.year;
    if (dto.weekNumber !== undefined) routine.weekNumber = dto.weekNumber;
    if (dto.days !== undefined) routine.days = dto.days;
    return this.routineRepository.save(routine);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.routineRepository.delete(id);
  }
}
