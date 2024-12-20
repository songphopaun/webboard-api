import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { standardResponse } from 'src/response.util';
import { PostResponse } from 'src/interface/response.interface';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request,
  ): Promise<PostResponse<PostEntity>> {
    const userId = req['user'].id;
    const result = await this.postService.create(createPostDto, userId);
    return standardResponse(200, 'Create successfully', result);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostResponse<PostEntity>> {
    const result = await this.postService.update(id, updatePostDto);
    return standardResponse(200, 'Update successfully', result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<PostResponse<void>> {
    await this.postService.remove(id);
    return standardResponse(200, 'Deleted successfully');
  }

  @Get()
  async getAllPosts(
    @Query('communityId') communityId?: number,
  ): Promise<PostResponse<PostEntity[]>> {
    const result = await this.postService.findAll(communityId);
    return standardResponse(200, 'Get posts successfully', result);
  }
}
