import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import {  UserSchema } from '../auth/schemas/user.schema';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ProfileModule
],
  controllers: [UsersController],
  providers: [UsersService],
  
  
})
export class UsersModule {}
