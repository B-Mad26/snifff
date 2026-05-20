import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { MatchesService } from './matches.service';
import { RecommendService } from './recommend.service';

@ApiTags('matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private matches: MatchesService, private recs: RecommendService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) { return this.matches.findForUser(u.id); }

  @Get('stack')
  stack(@CurrentUser() u: AuthUser, @Query('petId') petId: string, @Query('mode') mode = 'FRIENDS') {
    return this.recs.buildStack(u.id, petId, mode);
  }

  @Delete(':id')
  unmatch(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.matches.unmatch(u.id, id); }
}
