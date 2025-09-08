export interface CreateCommentRequest {
  content: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    firstname: string | null;
    lastname: string | null;
    avatar: string | null;
  };
  postId: string;
  likeCount: number; 
}

export interface CreateCommentApiResponse {
  success: boolean;
  message: string;
  data?: CommentResponse;
}