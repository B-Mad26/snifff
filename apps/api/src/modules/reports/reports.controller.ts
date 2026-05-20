import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

class ReportDto {
  @IsEnum(['USER','PET','POST','MESSAGE','CHAT']) targetKind!: any;
  @IsUUID() targetId!: string;
  @IsEnum(['SPAM','NUDITY','ABUSE','HARASSMENT','FAKE','UNDERAGE','BREEDING_VIOLATION','ANIMAL_ABUSE','OTHER']) reason!: any;
  @IsOptional() @IsString() detail?: string;
}

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Post()
  submit(@CurrentUser() u: AuthUser, @Body() dto: ReportDto) { return this.reports.submit(u.id, dto); }
}
