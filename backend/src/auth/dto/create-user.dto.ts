import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class CreateUserDto {

  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;

  @IsString()
  @Matches(
    /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9-_/]+$/,
    { message: 'Invalid LinkedIn URL' },
  )
  readonly linkedinUrl: string;

  @IsOptional()
  @IsString()
  readonly linkedinPhoto?: string;

  @IsOptional()
  @IsString()
  readonly linkedinBio?: string;
}
