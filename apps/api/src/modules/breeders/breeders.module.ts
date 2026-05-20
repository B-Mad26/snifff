import { Module } from '@nestjs/common';
import { BreedersController } from './breeders.controller';
import { BreedersService } from './breeders.service';

@Module({ controllers: [BreedersController], providers: [BreedersService] })
export class BreedersModule {}
