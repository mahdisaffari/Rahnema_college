export interface ProfileResponse {
  id: string;
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  bio: string | null;
  avatar: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface UserResponse {
  id: string;
  username: string;
  firstname: string | null;
  lastname: string | null;
  bio: string | null;
  avatar: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface UserUpdateRequest {
  firstname?: string;
  lastname?: string;
  bio?: string;
  avatar?: Express.Multer.File;
  email?: string;
  password?: string;
}

export interface UserApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}