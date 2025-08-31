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

export interface CreatePostResponse {
  success: boolean;
  message: string;
  data?: PostDTO;
}


