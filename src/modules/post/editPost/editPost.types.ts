import { PostImageDTO, PostResponse } from '../post.types';

export interface EditPostRequest {
  caption?: string;
  images?: Express.Multer.File[];
  removeImageIds?: string[];
  mentions?: string[]; 
}

export interface EditPostResponse {
  success: boolean;
  message: string;
  data?: PostResponse;
}