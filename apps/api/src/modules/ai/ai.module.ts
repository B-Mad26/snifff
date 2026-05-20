import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { BioService } from './services/bio.service';
import { BreedService } from './services/breed.service';
import { CaptionService } from './services/caption.service';

@Module({
  controllers: [AiController],
  providers: [BioService, BreedService, CaptionService],
  exports: [BioService, BreedService, CaptionService],
})
export class AiModule {}
