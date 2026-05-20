import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ModerationModule } from '../moderation/moderation.module';

@Module({ imports: [ModerationModule], controllers: [ChatsController], providers: [ChatsService], exports: [ChatsService] })
export class ChatsModule {}
