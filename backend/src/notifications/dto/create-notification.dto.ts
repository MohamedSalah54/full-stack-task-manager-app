// src/notifications/dto/create-notification.dto.ts
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
