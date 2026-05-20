import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { BreedersService } from './breeders.service';

class CreateBreederDto {
  @IsString() @MaxLength(160) kennelName!: string;
  @IsOptional() @IsString() registry?: string;
  @IsOptional() @IsString() registryNo?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsArray() verificationDocs?: any[];
}

@ApiTags('breeders')
@Controller('breeders')
export class BreedersController {
  constructor(private breeders: BreedersService) {}

  @Get() listVerified() { return this.breeders.listVerified(); }

  @Get(':id') one(@Param('id') id: string) { return this.breeders.findById(id); }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  apply(@CurrentUser() u: AuthUser, @Body() dto: CreateBreederDto) { return this.breeders.apply(u.id, dto); }
}
