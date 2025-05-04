import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-users.dto';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class UsersService {
  findById(userId: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: ProfileService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async searchUsers(searchQuery: SearchUserDto): Promise<User[]> {
    const query: any = {};
  
    if (searchQuery) {
      query.$or = [];
  
      if (searchQuery.name) {
        query.$or.push({ name: { $regex: searchQuery.name, $options: 'i' } });
      }
      if (searchQuery.email) {
        query.$or.push({ email: { $regex: searchQuery.email, $options: 'i' } });
      }
      if (searchQuery.role) {
        query.$or.push({ role: { $regex: searchQuery.role, $options: 'i' } });
      }
    }
  
  
    const results = await this.userModel.find(query).exec();
  
    return results;
  }
  
  
  async updateUser(id: string, dto: UpdateUserDto): Promise<User | null> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  
    if (updatedUser) {
      const user = updatedUser as User;
  
      console.log('Updated user:', user);
  
      const profile = await this.profileService.getProfileByUserId((user._id as Types.ObjectId).toString());
  
      if (profile) {
        console.log('Profile found:', profile);
  
        const updatedProfile = await this.profileService.updateProfile((user._id as Types.ObjectId).toString(), {
          role: user.role,   
          name: user.name,   
          email: user.email,
        });
  
        console.log('Updated Profile:', updatedProfile);
      } else {
        console.log("Profile not found for user:", user._id);
      }
    }
  
    return updatedUser;
  }
  

  async deleteUser(id: string): Promise<User | null> {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
  
    if (deletedUser) {
      await this.profileService.deleteByUserId(id);
    }
  
    return deletedUser;
  }
  

  async deleteManyUsers(ids: string[]): Promise<{ deletedCount?: number }> {
    const result = await this.userModel.deleteMany({ _id: { $in: ids } });
  
    if (result.deletedCount) {
      await Promise.all(ids.map(id => this.profileService.deleteByUserId(id)));
    }
  
    return { deletedCount: result.deletedCount };
  }
  
}
