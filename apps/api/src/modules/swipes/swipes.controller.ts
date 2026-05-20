import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { SwipesService } from './swipes.service';

class SwipeDto {
  @IsUUID() swiperPetId!: string;
  @IsUUID() targetPetId!: string;
  @IsEnum(['SNIFF','SUPER_SNIFF','PASS']) action!: 'SNIFF' | 'SUPER_SNIFF' | 'PASS';
  @IsEnum(['FRIENDS','BREEDING','ADOPTION','PLAYDATE','LOST']) mode!: any;
}

@ApiTags('swipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('swipes')
export class SwipesController {
  constructor(private swipes: SwipesService) {}

  @Post()
  swipe(@CurrentUser() u: AuthUser, @Body() dto: SwipeDto) {
    return this.swipes.record(u.id, dto);
  }
}
