import { Schema, Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  linkedinUrl: string;
  linkedinPhoto: string;  
  linkedinBio: string;   
  name: string;
  title: string
}

export const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  linkedinPhoto: { type: String },  
  linkedinBio: { type: String },   
  name: { type: String},      
  title: { type: String},      
});
