import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsString()
  teamLead?: string;

  @IsOptional()
  @IsString()
  role?: 'user' | 'team-lead' | 'admin'; 

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
