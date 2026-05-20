import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { UploadsService } from './uploads.service';

class SignDto {
  @IsString() filename!: string;
  @Matches(/^(image|video)\/(jpeg|png|webp|mp4|quicktime)$/) contentType!: string;
}

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Post('sign')
  sign(@CurrentUser() u: AuthUser, @Body() dto: SignDto) { return this.uploads.signUploadUrl(u.id, dto.filename, dto.contentType); }
}
