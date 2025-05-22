import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schema/comment.schema';
import { User } from 'src/auth/schemas/user.schema'; 
import { UserDocument } from 'src/auth/schemas/user.schema';
import { Task, TaskDocument } from '../schemas/task.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>, 

  ) { }

  async create(createCommentDto: CreateCommentDto, userId: string) {
  const user = await this.userModel.findById(userId).lean();
  if (!user) {
    console.log('User not found with ID:', userId);
    throw new NotFoundException('User not found');
  }

  const comment = new this.commentModel({
    text: createCommentDto.text,
    taskId: new Types.ObjectId(createCommentDto.taskId),
    author: new Types.ObjectId(userId),
    image: createCommentDto.image,
  });

  const saved = await comment.save();

  await this.taskModel.findByIdAndUpdate(createCommentDto.taskId, {
    $inc: { commentsCount: 1 },
  });

  const populatedComment = await this.commentModel
    .findById(saved._id)
    .populate('author', 'name image'); 


  return populatedComment;
}



async findByTask(taskId: string) {
  return this.commentModel
    .find({ taskId: new Types.ObjectId(taskId) })
    .populate("author", "name image") 
    .sort({ createdAt: -1 })
    .exec();
}




async update(commentId: Types.ObjectId, updateCommentDto: UpdateCommentDto) {
  const updated = await this.commentModel.findByIdAndUpdate(commentId.toString(), updateCommentDto, { new: true });
  if (!updated) {
    throw new NotFoundException('Comment not found');
  }
  return updated;
}



async delete(commentId: Types.ObjectId) {
  const comment = await this.commentModel.findById(commentId);
  if (!comment) throw new NotFoundException('Comment not found');

  await this.commentModel.deleteOne({ _id: commentId });

  await this.taskModel.findByIdAndUpdate(comment.taskId, { $inc: { commentsCount: -1 } });

  return { message: 'Comment deleted successfully' };
}

}

