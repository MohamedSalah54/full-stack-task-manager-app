import { IsString, IsBoolean, IsEnum, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

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
}
