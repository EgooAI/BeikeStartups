// frontend/types/index.ts
export interface User {
  id: number;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}

export type UserRole = 'student' | 'mentor' | 'investor' | 'partner' | 'admin';

export interface Team {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  logo?: string;
  status: TeamStatus;
  owner_id: number;
  owner?: User;
  members?: User[];
}

export type TeamStatus = 'pending' | 'approved' | 'rejected';

export interface Application {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  business_plan?: string;
  status: ApplicationStatus;
  user_id: number;
  user?: User;
  review_note?: string;
  reviewed_by?: number;
  reviewed_at?: string;
}

export type ApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Project {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  content?: string;
  cover_image?: string;
  status: ProjectStatus;
  is_public: boolean;
  team_id: number;
  team?: Team;
  tags?: string;
  view_count: number;
}

export type ProjectStatus = 
  | 'draft' 
  | 'pending_online' 
  | 'online' 
  | 'rejected_online' 
  | 'pending_offline' 
  | 'offline' 
  | 'rejected_offline' 
  | 'invalid';

export interface Recruitment {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  requirements?: string;
  status: RecruitmentStatus;
  team_id: number;
  team?: Team;
  position: string;
  salary?: string;
  deadline?: string;
}

export type RecruitmentStatus = 'active' | 'solved' | 'invalid';

export interface Response {
  id: number;
  created_at: string;
  updated_at: string;
  cover_letter: string;
  resume?: string;
  status: ResponseStatus;
  recruitment_id: number;
  recruitment?: Recruitment;
  user_id: number;
  user?: User;
  review_note?: string;
}

export type ResponseStatus = 'pending' | 'accepted' | 'rejected' | 'invalid';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}