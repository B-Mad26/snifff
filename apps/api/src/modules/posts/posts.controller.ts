import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';
import { PostsService } from './posts.service';

class CreatePostDto {
  @IsUUID() petId!: string;
  @IsEnum(['PHOTO','CAROUSEL','TAIL','STORY']) type!: any;
  @IsArray() media!: any[];
  @IsOptional() @IsString() @MaxLength(2200) caption?: string;
  @IsOptional() @IsArray() hashtags?: string[];
  @IsOptional() @IsEnum(['PUBLIC','FRIENDS','PACK']) visibility?: any;
}
class CommentDto { @IsString() @MaxLength(1000) body!: string; @IsOptional() @IsUUID() parentId?: string; }

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CreatePostDto) { return this.posts.create(u.id, dto); }

  @Get(':id')
  one(@Param('id') id: string) { return this.posts.findById(id); }

  @Delete(':id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.posts.remove(u.id, id); }

  @Post(':id/like')
  like(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.posts.like(u.id, id); }

  @Delete(':id/like')
  unlike(@CurrentUser() u: AuthUser, @Param('id') id: string) { return this.posts.unlike(u.id, id); }

  @Post(':id/comments')
  comment(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: CommentDto) {
    return this.posts.comment(u.id, id, dto.body, dto.parentId);
  }

  @Get(':id/comments')
  comments(@Param('id') id: string, @Query('cursor') cursor?: string) { return this.posts.listComments(id, cursor); }
}
