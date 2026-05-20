import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notifs: NotificationsService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) { return this.notifs.list(u.id); }

  @Post('read-all')
  readAll(@CurrentUser() u: AuthUser) { return this.notifs.markAllRead(u.id); }
}
