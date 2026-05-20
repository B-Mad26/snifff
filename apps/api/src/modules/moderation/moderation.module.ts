import { Module } from '@nestjs/common';
import { ToxicityService } from './services/toxicity.service';
import { ImageModerationService } from './services/image.service';

@Module({
  providers: [ToxicityService, ImageModerationService],
  exports: [ToxicityService, ImageModerationService],
})
export class ModerationModule {}
