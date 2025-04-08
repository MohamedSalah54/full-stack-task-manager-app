// profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from './schema/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
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
  
  

  async getAllProfiles(): Promise<Profile[]> {
    return this.profileModel.find();
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    return this.profileModel.findOne({ userId }).exec();
  }
  

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileModel.findOneAndUpdate(
      { userId },
      { ...dto, updatedAt: new Date() },
      { new: true },
    );
  
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
  
    return profile;
  }
  
  
  
  async deleteByUserId(userId: string): Promise<void> {
    await this.profileModel.findOneAndDelete({ userId });
  }
  
}
