import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { StudentActivityService } from '../student-activity/student-activity.service';
import {
  parseReferralCode,
  referralCodeFromUserId,
} from './referral-code.util';

export interface ReferralSummaryResponse {
  codigo: string;
  activados: number;
  usosEstaSemana: number;
  codigoReferidor: string | null;
  puedeAplicarCodigo: boolean;
}

import { XP_REFERRAL } from '../student-activity/xp-rewards.constants';

function getMondayYmd(): string {
  const today = new Date();
  const jsDay = today.getDay();
  const diff = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly studentActivityService: StudentActivityService,
  ) {}

  async getSummary(userId: string): Promise<ReferralSummaryResponse> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const activados = await this.usersRepo.count({
      where: { referredByUserId: userId },
    });

    const weekStart = getMondayYmd();
    const usosEstaSemana = await this.usersRepo
      .createQueryBuilder('u')
      .where('u.referred_by_user_id = :userId', { userId })
      .andWhere('u.referred_at >= :weekStart', { weekStart })
      .getCount();

    let codigoReferidor: string | null = null;
    if (user.referredByUserId) {
      codigoReferidor = referralCodeFromUserId(user.referredByUserId);
    }

    return {
      codigo: referralCodeFromUserId(userId),
      activados,
      usosEstaSemana,
      codigoReferidor,
      puedeAplicarCodigo: user.referredByUserId == null,
    };
  }

  async applyCode(userId: string, rawCode: string): Promise<ReferralSummaryResponse> {
    const suffix = parseReferralCode(rawCode);
    if (!suffix) {
      throw new BadRequestException('Código de referido inválido');
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.referredByUserId) {
      throw new ConflictException('Ya activaste un código de referido');
    }

    const ownCode = referralCodeFromUserId(userId);
    if (ownCode === `MITSYY-${suffix}`) {
      throw new BadRequestException('No puedes usar tu propio código');
    }

    const matches = await this.usersRepo
      .createQueryBuilder('u')
      .where("UPPER(REPLACE(u.id::text, '-', '')) LIKE :prefix", {
        prefix: `${suffix}%`,
      })
      .getMany();

    if (matches.length === 0) {
      throw new NotFoundException('Código de referido no encontrado');
    }
    if (matches.length > 1) {
      throw new BadRequestException(
        'Código ambiguo; contacta soporte para activarlo',
      );
    }

    const referrer = matches[0];
    if (referrer.id === userId) {
      throw new BadRequestException('No puedes usar tu propio código');
    }

    const now = new Date();
    user.referredByUserId = referrer.id;
    user.referredAt = now;
    await this.usersRepo.save(user);

    await this.studentActivityService.recordXpEvent(
      userId,
      XP_REFERRAL,
      'referral_referee',
    );
    await this.studentActivityService.recordXpEvent(
      referrer.id,
      XP_REFERRAL,
      'referral_referrer',
    );

    return this.getSummary(userId);
  }
}
