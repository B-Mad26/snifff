import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PetsModule } from './modules/pets/pets.module';
import { SwipesModule } from './modules/swipes/swipes.module';
import { MatchesModule } from './modules/matches/matches.module';
import { ChatsModule } from './modules/chats/chats.module';
import { PostsModule } from './modules/posts/posts.module';
import { FeedModule } from './modules/feed/feed.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AiModule } from './modules/ai/ai.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BreedersModule } from './modules/breeders/breeders.module';
import { HealthController } from './common/health.controller';
import { WsModule } from './ws/ws.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PetsModule,
    SwipesModule,
    MatchesModule,
    ChatsModule,
    PostsModule,
    FeedModule,
    NotificationsModule,
    PaymentsModule,
    ModerationModule,
    AiModule,
    UploadsModule,
    ReportsModule,
    BreedersModule,
    WsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
