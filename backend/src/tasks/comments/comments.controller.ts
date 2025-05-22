import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

@Post()
@UseGuards(AuthGuard('jwt'))
async createComment(
  @Body() body: CreateCommentDto,
  @Req() req: Request,
) {
  const userId = (req as any).user?.userId;
  console.log('Create comment called with:', body, 'UserId:', userId);

  const result = await this.commentService.create(body, userId);
  console.log('Comment saved:', result);

  return result;  
}

@Get('/:taskId')
async getCommentsByTask(@Param('taskId') taskId: string) {
  return this.commentService.findByTask(taskId);
}


@Patch(':id')
@UseGuards(AuthGuard('jwt'))
async updateComment(@Param('id') id: string, @Body() body: UpdateCommentDto) {
  console.log('Updating comment with id:', id, 'with body:', body);
  return this.commentService.update(new Types.ObjectId(id), body);
}


@Delete(':id')
@UseGuards(AuthGuard('jwt'))
async deleteComment(@Param('id') id: string) {
  const commentId = new Types.ObjectId(id);
  return this.commentService.delete(commentId);
}


}
