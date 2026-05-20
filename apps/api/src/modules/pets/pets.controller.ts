import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { PetsService } from './pets.service';

class CreatePetDto {
  @IsString() @MaxLength(80) name!: string;
  @IsEnum(['DOG','CAT','RABBIT','BIRD','EXOTIC','OTHER']) species!: any;
  @IsOptional() @IsString() breedPrimary?: string;
  @IsOptional() @IsString() breedSecondary?: string;
  @IsOptional() @IsDateString() dob?: string;
  @IsOptional() @IsEnum(['MALE','FEMALE']) gender?: any;
  @IsOptional() @IsBoolean() intact?: boolean;
  @IsOptional() @IsEnum(['TOY','SMALL','MEDIUM','LARGE','GIANT']) size?: any;
  @IsOptional() @IsNumber() weightKg?: number;
  @IsOptional() @IsObject() personality?: Record<string, number>;
  @IsOptional() @IsString() @MaxLength(2000) bio?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(9) photos?: any[];
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
}

class UpdatePetDto extends CreatePetDto { @IsOptional() declare name?: any; @IsOptional() declare species?: any; }

class NearbyQueryDto {
  @IsNumber() @Min(0) lat!: number;
  @IsNumber() @Min(0) lng!: number;
  @IsOptional() @IsNumber() radiusKm?: number;
  @IsOptional() @IsString() mode?: string;
}

@ApiTags('pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private pets: PetsService) {}

  @Get()
  myPets(@CurrentUser() u: AuthUser) { return this.pets.findByOwner(u.id); }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CreatePetDto) { return this.pets.create(u.id, dto); }

  @Get('nearby')
  nearby(@CurrentUser() u: AuthUser, @Query() q: NearbyQueryDto) {
    return this.pets.nearby(u.id, q.lat, q.lng, q.radiusKm ?? 25, q.mode);
  }

  @Get(':id')
  one(@Param('id') id: string) { return this.pets.findById(id); }

  @Patch(':id')
  update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdatePetDto) {
    return this.pets.update(u.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.pets.remove(u.id, id); }

  @Post(':id/ai-bio')
  aiBio(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.pets.generateBio(u.id, id); }
}
