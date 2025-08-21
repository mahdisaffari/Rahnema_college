export interface ProfileUser {
  id: string;
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  bio: string | null;
  avatar: string | null;
}

export interface ProfileUpdateRequest {
  firstname?: string;
  lastname?: string;
  bio?: string;
  avatar?: Express.Multer.File; // فایل آواتار
  email?: string;
  password?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: ProfileUser;
}