export interface Profile {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'team lead';
  bio: string;
  position: string;
  team: string;
  teamLead: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  bio?: string;
  position?: string;
  team?: string;
  teamLead?: string;
  profileImage?: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'team lead';
}
