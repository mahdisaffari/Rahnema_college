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
  isFollowedByMe?: boolean; // optional for profile of current user
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
  isFollowedByMe: boolean; // required for other users
  isFollowingMe: boolean;
  isPrivate: boolean; 
}

export interface UserUpdateRequest {
  firstname?: string;
  lastname?: string;
  bio?: string;
  avatar?: Express.Multer.File | null;
  email?: string;
  password?: string;
}

export interface UserApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PrivateToggleRequest {
  isPrivate: boolean;
}

export interface PrivateToggleResponse {
  success: boolean;
  message: string;
  data: { isPrivate: boolean };
}