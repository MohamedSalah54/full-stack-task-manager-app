import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

@Schema({ timestamps: true })
export class Team extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teamLeader: Types.ObjectId;
  
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: (Types.ObjectId | User)[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] })
  tasks: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
