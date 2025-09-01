export interface CreatePostRequest {
  caption?: string;
  images?: Express.Multer.File[];
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
}

export interface PostResponse {
  id: string;
  caption: string | null;
  images: PostImageDTO[];
  createdAt: string;
  likeCount: number;
  bookmarkCount: number;
  user: {
    id: string;
    username: string;
    firstname: string | null;
    lastname: string | null;
    avatar: string | null;
  };
  isOwner?: boolean; 
}

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