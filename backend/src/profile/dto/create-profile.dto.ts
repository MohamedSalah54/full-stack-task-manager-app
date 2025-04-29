import { Types } from 'mongoose';

export class CreateProfileDto {
  userId: Types.ObjectId;  
  name: string;
  email: string;
  bio?: string;
  team?: string;
  teamLead?: string;
  role: string;
  position?: string;
  profileImage?: string;
}
