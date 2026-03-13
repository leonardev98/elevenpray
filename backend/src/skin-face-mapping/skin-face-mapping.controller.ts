import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkinFaceMappingService } from './skin-face-mapping.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMarkerDto, UpdateMarkerDto } from './dto/create-marker.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/face')
@UseGuards(JwtAuthGuard)
export class SkinFaceMappingController {
  constructor(private readonly service: SkinFaceMappingService) {}

  @Get('sessions')
  findAllSessions(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
  ) {
    return this.service.findAllSessions(workspaceId, userId, fromDate, toDate);
  }

  @Post('sessions')
  createSession(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateSessionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createSession(workspaceId, userId, dto);
  }

  @Get('markers')
  findAllMarkers(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('sessionId') sessionId?: string,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
    @Query('faceModelType') faceModelType?: 'female' | 'male',
  ) {
    return this.service.findAllMarkers(
      workspaceId,
      userId,
      sessionId,
      fromDate,
      toDate,
      faceModelType,
    );
  }

  @Get('markers/:markerId')
  findOneMarker(
    @Param('workspaceId') _workspaceId: string,
    @Param('markerId') markerId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findOneMarker(markerId, userId);
  }

  @Post('markers')
  createMarker(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateMarkerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createMarker(workspaceId, userId, dto);
  }

  @Patch('markers/:markerId')
  updateMarker(
    @Param('workspaceId') _workspaceId: string,
    @Param('markerId') markerId: string,
    @Body() dto: UpdateMarkerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.updateMarker(markerId, userId, dto);
  }

  @Delete('markers/:markerId')
  removeMarker(
    @Param('workspaceId') _workspaceId: string,
    @Param('markerId') markerId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.removeMarker(markerId, userId);
  }
}
