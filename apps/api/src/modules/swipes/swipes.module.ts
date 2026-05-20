import { Module } from '@nestjs/common';
import { SwipesController } from './swipes.controller';
import { SwipesService } from './swipes.service';
import { MatchesModule } from '../matches/matches.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MatchesModule, NotificationsModule],
  controllers: [SwipesController],
  providers: [SwipesService],
})
export class SwipesModule {}
