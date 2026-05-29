import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReferralsService } from './referrals.service';
import { ApplyReferralDto } from './dto/apply-referral.dto';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly service: ReferralsService) {}

  @Get('summary')
  getSummary(@CurrentUser('id') userId: string) {
    return this.service.getSummary(userId);
  }

  @Post('apply')
  applyCode(@CurrentUser('id') userId: string, @Body() dto: ApplyReferralDto) {
    return this.service.applyCode(userId, dto.code);
  }
}
