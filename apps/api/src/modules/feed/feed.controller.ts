import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { FeedService } from './feed.service';

@ApiTags('feed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private feed: FeedService) {}

  @Get('tails')
  tails(@CurrentUser() u: AuthUser, @Query('cursor') cursor?: string) { return this.feed.tails(u.id, cursor); }

  @Get('discover')
  discover(@CurrentUser() u: AuthUser, @Query('cursor') cursor?: string) { return this.feed.discover(u.id, cursor); }
}
