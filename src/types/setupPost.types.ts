export interface CreatePostRequest {
  caption?: string;
  images?: Express.Multer.File[];
}

export interface PostImageDTO {
  id: number;
  url: string;
}

export interface PostDTO {
  id: number;
  caption: string | null;
  images: PostImageDTO[];
  createdAt: string;
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  data?: PostDTO;
}


