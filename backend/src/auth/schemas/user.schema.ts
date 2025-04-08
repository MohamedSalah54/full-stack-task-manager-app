// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  TEAM_LEAD = 'team-lead',
  USER = 'user',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  linkedinUrl: string;

  @Prop()
  linkedinPhoto: string;

  @Prop()
  linkedinBio: string;

  @Prop()
  name: string;

  @Prop()
  title: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: 'https://i.pinimg.com/736x' })
  image: string;

  @Prop({ type: [Object], default: [] })
  notifications: any[];

  @Prop({
    type: {
      allTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      incompleteTasks: { type: Number, default: 0 },
    },
  })
  tasks: {
    allTasks: number;
    completedTasks: number;
    incompleteTasks: number;
  };

  @Prop()
  teamLeader: string;

  @Prop()
  team: string;

  @Prop()
  position: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
