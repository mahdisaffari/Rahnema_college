import { AuthUser } from "./auth.types";

export interface ProfileUser extends AuthUser {
  firstname: string | null;
  lastname: string | null;
  bio: string | null;
  avatar: string | null;
}

export interface ProfileUpdateRequest {
  firstname?: string;
  lastname?: string;
  bio?: string;
  avatar?: string;
  email?: string; 
  password?: string; 
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: ProfileUser;
}