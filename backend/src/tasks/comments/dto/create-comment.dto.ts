import { IsNotEmpty, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;



  @IsMongoId()
  taskId: Types.ObjectId;

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  text?: string;
}
