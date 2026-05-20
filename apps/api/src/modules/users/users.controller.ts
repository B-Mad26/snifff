import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { UsersService } from './users.service';

class UpdateMeDto {
  @IsOptional() @IsString() @MaxLength(80) firstName?: string;
  @IsOptional() @IsString() @MaxLength(280) bio?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() language?: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() u: AuthUser) { return this.users.findById(u.id, true); }

  @Patch('me')
  updateMe(@CurrentUser() u: AuthUser, @Body() dto: UpdateMeDto) { return this.users.update(u.id, dto); }

  @Get(':id')
  one(@Param('id') id: string) { return this.users.findById(id, false); }
}
