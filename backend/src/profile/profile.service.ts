import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from './schema/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UsersService } from 'src/users/user.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) {}

  async createProfile(dto: CreateProfileDto): Promise<Profile> {
    return this.profileModel.create({
      userId: dto.userId,
      name: dto.name,
      email: dto.email,
      bio: '',
      team: '',
      teamLead: '',
      role: dto.role,
      position: '',
      profileImage: '',
    });
  }
  

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    return this.profileModel.findOne({ userId }).exec();
  }

  async updateProfileForAdmin(
    userId: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File, 
  ): Promise<Profile> {
    if (Object.keys(dto).length === 0 && !file) {
      throw new Error('No fields to update');
    }
  
    const allowedFields = ['bio', 'position', 'team', 'teamLead', 'profileImage', 'name', 'email', 'role'];
    const filteredDto: Partial<UpdateProfileDto> = {};
  
    for (const key of allowedFields) {
      if (dto[key]) {
        filteredDto[key] = dto[key];
      }
    }
  
    if (file) {
      filteredDto.profileImage = file.path;
    }
  
    const profile = await this.profileModel.findOneAndUpdate(
      { userId },
      { ...filteredDto, updatedAt: new Date() },
      { new: true }
    );
  
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
  
    if (file) {
      await this.userService.updateUser(userId, {
        image: filteredDto.profileImage, 
      });
    }
  
    if (dto.role || dto.name || dto.email || filteredDto.profileImage) {
      await this.userService.updateUser(userId, {
        role: dto.role as 'user' | 'team-lead' | 'admin',
        name: dto.name,
        email: dto.email,
        image: filteredDto.profileImage, 
      });
    }
  
    return profile;
  }

  

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    if (Object.keys(dto).length === 0) {
      throw new Error('No fields to update');
    }
  
    const allowedFields = ['bio', 'position', 'team', 'teamLead', 'profileImage', 'name', 'email', 'role'];
    const filteredDto: Partial<UpdateProfileDto> = {};
  
    for (const key of allowedFields) {
      if (dto[key]) {
        filteredDto[key] = dto[key];
      }
    }
  
    const profile = await this.profileModel.findOneAndUpdate(
      { userId },
      { ...filteredDto, updatedAt: new Date() },
      { new: true }
    );
  
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
  
    if (dto.profileImage) {
      await this.userService.updateUser(userId, {
        image: dto.profileImage, 
      });
    }
  
    return profile;
  }



  async deleteByUserId(userId: string): Promise<void> {
    await this.profileModel.findOneAndDelete({ userId });
  }
  
}
