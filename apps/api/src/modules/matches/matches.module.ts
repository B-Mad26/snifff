import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { CompatibilityService } from './compatibility.service';
import { RecommendService } from './recommend.service';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, CompatibilityService, RecommendService],
  exports: [MatchesService, RecommendService],
})
export class MatchesModule {}
