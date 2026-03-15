import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DiscoveryPromptsService } from './discovery-prompts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('discovery-prompts')
@UseGuards(JwtAuthGuard)
export class DiscoveryPromptsController {
  constructor(
    private readonly discoveryPromptsService: DiscoveryPromptsService,
  ) {}

  @Get()
  findByLocaleAndSection(
    @Query('locale') locale: string,
    @Query('section') section: string,
  ) {
    const safeLocale = locale && ['es', 'en'].includes(locale) ? locale : 'en';
    const safeSection =
      section && ['prompts_of_the_day', 'trending'].includes(section)
        ? section
        : 'prompts_of_the_day';
    return this.discoveryPromptsService.findByLocaleAndSection(
      safeLocale,
      safeSection,
    );
  }
}
