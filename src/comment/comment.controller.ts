import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { standardResponse } from 'src/response.util';
import { PostResponse } from 'src/interface/response.interface';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ): Promise<PostResponse<any>> {
    const userId = req['user'].id;
    const result = await this.commentService.create(createCommentDto, userId);
    return standardResponse(200, 'Create successfully', result);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const userId = req['user'].id;
    const result = await this.commentService.update(
      id,
      updateCommentDto,
      userId,
    );
    return standardResponse(200, 'Update successfully', result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: Request) {
    const userId = req['user'].id;
    await this.commentService.remove(id, userId);
    return standardResponse(200, 'Deleted successfully');
  }

  @Get(':id/comments')
  async getCommentsByPost(@Param('id') postId: number) {
    const result = await this.commentService.getCommentsByPost(postId);
    return standardResponse(200, 'get comment by post successfully', result);
  }
}
