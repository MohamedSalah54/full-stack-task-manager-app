export interface Member {
  position: ReactNode;
  _id: string;
  name: string;
  email: string;
  image: string;
}
export interface Team {
  _id: string;
  name: string;
  description?: string;
  members: Member[];
  teamLeader: {
    _id: string;
    name: string;
    email: string;
    image: string;
  };
}
export interface TeamState {
  teams: Team[];       
  loading: boolean;
  error: string | null;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  members: string[];
}
  export interface UpdateTeamDto {
    name?: string;       
    description?: string; 
    members?: string[];  
  }

