import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<string> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = new this.userModel({
      email: createUserDto.email,
      password: hashedPassword,
      linkedinUrl: createUserDto.linkedinUrl,
      linkedinPhoto: createUserDto.linkedinPhoto,
      linkedinBio: createUserDto.linkedinBio,
    });

    await newUser.save();

    const payload = { email: newUser.email, sub: String(newUser._id) };
    return this.jwtService.sign(payload);
  }

  async login(loginUserDto: LoginUserDto): Promise<string> {
    const user = await this.userModel.findOne({ email: loginUserDto.email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { email: user.email, sub: String(user._id) };
    return this.jwtService.sign(payload);
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
