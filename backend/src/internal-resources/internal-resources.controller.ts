import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ResourceIngestedDto } from './dto/resource-ingested.dto';
import { InternalTokenGuard } from './guards/internal-token.guard';
import { InternalResourcesService } from './internal-resources.service';

@Controller('internal/resources')
@UseGuards(InternalTokenGuard)
export class InternalResourcesController {
  constructor(private readonly internalResourcesService: InternalResourcesService) {}

  @Post('ingested')
  ingested(@Body() dto: ResourceIngestedDto) {
    return this.internalResourcesService.handleResourceIngested(dto);
  }
}
