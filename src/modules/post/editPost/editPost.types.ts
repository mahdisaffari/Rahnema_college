export interface EditPostRequest {
  caption?: string;
  images?: Express.Multer.File[];
  removeImageIds?: string[];
  mentions?: string[];
  isCloseFriendsOnly?: boolean;
}

export interface EditPostResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    caption?: string | null; 
    images: { id: string; url: string }[];
    mentions: { userId: string; username: string }[]; 
    isCloseFriendsOnly: boolean;
  };
}