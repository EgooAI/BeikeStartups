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

export type UserRole = 'student' | 'team_member' | 'team_owner' | 'mentor' | 'investor' | 'partner' | 'admin' | 'super_admin';

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

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  user?: User;
  role: 'owner' | 'member';
  joined_at: string;
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
  stage: ProjectStage;
  industry?: string;
  funding_need?: string;
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

export type ProjectStage = 'idea' | 'seed' | 'prototype' | 'launched' | 'revenue';

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

export interface Signup {
  id: number;
  created_at: string;
  updated_at: string;
  event_id: number;
  event?: Event;
  user_id: number;
  user?: User;
  status: 'pending' | 'confirmed' | 'cancelled';
  review_note?: string;
}

export interface ConnectionRequest {
  id: number;
  created_at: string;
  updated_at: string;
  project_id: number;
  project?: Project;
  user_id: number;
  user?: User;
  request_type: ConnectionRequestType;
  status: ConnectionRequestStatus;
  message?: string;
  review_note?: string;
}

export type ConnectionRequestType = 'bp_access' | 'become_mentor' | 'resource_partner';

export type ConnectionRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: 'roadshow' | 'workshop' | 'mentoring' | 'other';
  location: string;
  start_at: string;
  end_at: string;
  status: 'active' | 'closed' | 'cancelled';
  cover_image?: string;
  max_participants?: number;
  current_participants: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  user?: User;
}

export interface ApiResponse<T = Event> {
  code: number;
  message: string;
  data?: T;
}