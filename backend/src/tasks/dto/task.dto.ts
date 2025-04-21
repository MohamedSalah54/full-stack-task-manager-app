import { IsString, IsBoolean, IsEnum, IsDateString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export enum TaskCategory {
  WORK = "work",
  PERSONAL = "personal",
  SHOPPING = "shopping"
}


export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsEnum(TaskCategory, { message: 'Category must be one of: work, personal, shopping' }) 
  category: TaskCategory;

  @IsDateString({ strict: true }, { message: 'Due date must be a valid date string' })
  @IsNotEmpty({ message: 'Due date is required' })
  dueDate: string;

  @IsOptional()
  @IsMongoId({ message: 'assignedTo must be a valid user ID' })
  assignedTo?: string;
}


export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskCategory, { message: 'Category must be one of: work, personal, shopping' }) 
  category?: TaskCategory;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Due date must be a valid date string' })
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsMongoId({ message: 'teamId must be a valid MongoDB ObjectId' })
  teamId?: string; 

  @IsOptional()
  @IsMongoId({ message: 'assignedTo must be a valid MongoDB ObjectId' })
  assignedTo?: Types.ObjectId; 
}


