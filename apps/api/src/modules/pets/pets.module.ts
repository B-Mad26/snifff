import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { AiModule } from '../ai/ai.module';

@Module({ imports: [AiModule], controllers: [PetsController], providers: [PetsService], exports: [PetsService] })
export class PetsModule {}
