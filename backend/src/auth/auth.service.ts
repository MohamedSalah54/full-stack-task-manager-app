import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ProfileService } from '../profile/profile.service';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly profileService: ProfileService,
  ) {}

  async createUserByAdmin(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
  
    const user = new this.userModel({
      ...dto,
      password: hashedPassword,
    });
  
    const savedUser = await user.save();
  
    const userId =( savedUser._id as Types.ObjectId); 
  
    await this.profileService.createProfile({
      userId: userId,  
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    });
  
    return savedUser;
  }
  
  
  
  
  

  async login(loginUserDto: LoginUserDto): Promise<{ token: string; user: any }> {
    const user = await this.userModel.findOne({ email: loginUserDto.email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
  
    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }
  
    const payload = { email: user.email, sub: String(user._id), role: user.role };
    const token = this.jwtService.sign(payload);
  
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
  

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email });
  }

  async findById(userId: string): Promise<User | null> {
    return await this.userModel.findById(userId);
  }

  async updateUserProfile(
    userId: string,
    updateData: { 
      linkedinPhoto?: string; 
      linkedinBio?: string; 
      linkedinUrl?: string; 
      name?: string; 
    }
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      ...(updateData.linkedinPhoto !== undefined && { linkedinPhoto: updateData.linkedinPhoto }),
      ...(updateData.linkedinBio !== undefined && { linkedinBio: updateData.linkedinBio }),
      ...(updateData.name !== undefined && { name: updateData.name }),
    });
  }
}
