import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string; 
    email: string;
  };
}

@Controller('profile')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return await this.authService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const userId = req.user.userId;
    await this.authService.updateUserProfile(userId, {
      name: updateProfileDto.name,
      linkedinBio: updateProfileDto.bio,
      linkedinUrl: updateProfileDto.linkedin,
    });
    return await this.authService.findById(userId);
  }
}
