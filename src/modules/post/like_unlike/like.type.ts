export interface LikeResponse {
  success: boolean;
  message: string;
  data?: {
    postId: string;
    userId: string;
    likeCount: number;
  };
}