import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;

  @IsString()
  @MinLength(1, { message: 'Name is required' })
  readonly name: string;

}
