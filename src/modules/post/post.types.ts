export interface CreatePostRequest {
  caption?: string;
  images?: Express.Multer.File[];
  mentions?: string[];
}

export interface PostImageDTO {
  id: string;
  url: string;
}

export interface PostDTO {
  id: string;
  caption: string | null;
  images: PostImageDTO[];
  createdAt: string;
  mentions?: { userId: string; username: string }[];
}

export interface PostResponse {
  id: string;
  caption: string | null;
  images: PostImageDTO[];
  createdAt: string;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number; 
  user: {
    id: string;
    username: string;
    firstname: string | null;
    lastname: string | null;
    avatar: string | null;
  };
  isOwner?: boolean;
  isLiked?: boolean; 
  isBookmarked?: boolean;
  mentions?: { userId: string; username: string }[];
  hashtags?: string[];
}

// بقیه فایل بدون تغییر

export interface PostApiResponse {
  success: boolean;
  message: string;
  data?: PostResponse;
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  data?: PostDTO;
}

export interface ValidateAllResponse {
  success: boolean;
  message: string;
  data?: { images?: string | null; caption?: string | null; mentions?: string | null; hashtags?: string | null };
}

export interface UserPostsResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      firstname: string | null;
      lastname: string | null;
      avatar: string | null;
    };
    posts: PostResponse[];
  };
}