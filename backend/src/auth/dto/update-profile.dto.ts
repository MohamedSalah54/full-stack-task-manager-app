import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  name: string;

  @IsString()
  bio: string;

  @IsString()
  linkedin: string;
}
