import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { ChatsService } from './chats.service';

class SendMessageDto {
  @IsEnum(['TEXT','IMAGE','VIDEO','VOICE','STICKER']) type!: any;
  @IsOptional() @IsString() @MaxLength(2000) content?: string;
  @IsOptional() @IsString() mediaUrl?: string;
}

@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private chats: ChatsService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) { return this.chats.list(u.id); }

  @Get(':id/messages')
  messages(@CurrentUser() u: AuthUser, @Param('id') id: string, @Query('cursor') cursor?: string) {
    return this.chats.messages(u.id, id, cursor);
  }

  @Post(':id/messages')
  send(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.chats.send(u.id, id, dto);
  }
}
