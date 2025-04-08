import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from './decorator/current-user.decorator';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getAll() {
    return this.profileService.getAllProfiles();
  }

  @Get(':userId')
  getByUserId(@Param('userId') userId: string) {
    return this.profileService.getProfileByUserId(userId); 
  }
  

  @Patch('me')
@UseGuards(AuthGuard('jwt'))
async updateMyProfile(
  @CurrentUser() user: any, 
  @Body() dto: UpdateProfileDto,
) {
  return this.profileService.updateProfile(user._id, dto);
}

}
