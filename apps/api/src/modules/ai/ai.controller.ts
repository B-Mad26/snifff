import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { BioService } from './services/bio.service';
import { BreedService } from './services/breed.service';
import { CaptionService } from './services/caption.service';

class BioDto { @IsString() petId!: string; }
class BreedDto { @IsUrl() imageUrl!: string; }
class CaptionDto { @IsUrl() imageUrl!: string; }

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private bio: BioService, private breed: BreedService, private caption: CaptionService) {}

  @Post('bio')      bioGen(@Body() dto: BioDto)        { return this.bio.generateById(dto.petId); }
  @Post('breed-id') breedId(@Body() dto: BreedDto)     { return this.breed.identify(dto.imageUrl); }
  @Post('caption')  captionGen(@Body() dto: CaptionDto) { return this.caption.suggest(dto.imageUrl); }
}
