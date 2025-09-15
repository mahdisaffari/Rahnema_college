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
  replies: CommentResponse[];
}

export interface CreateCommentApiResponse {
  success: boolean;
  message: string;
  data?: CommentResponse;
}

export interface LikeCommentResponse {
  success: boolean;
  message: string;
  data?: {
    likeCount: number;
    liked: boolean;
  };
}

export interface GetPostCommentsResponse {
  success: boolean;
  message: string;
  data?: {
    comments: CommentResponse[];
    total: number;
    page: number;
    limit: number;
  };
}