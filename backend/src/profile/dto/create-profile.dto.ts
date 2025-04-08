export class CreateProfileDto {
  userId: string; 
  name: string;
  email: string;
  bio?: string;
  team?: string;
  teamLead?: string;
  role: string;
  position?: string;
  profileImage?: string;
}
