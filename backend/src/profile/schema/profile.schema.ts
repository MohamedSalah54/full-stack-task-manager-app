import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  team: string;

  @Prop({ default: '' })
  teamLead: string;

  @Prop({ default: 'user' }) 
  role: string;
  
  @Prop({ default: '' })
  position: string;

  @Prop({ default: '' })
  profileImage: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
