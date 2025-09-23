export interface CreatePostRequest {
  caption?: string;
  mentions?: string[];
  isCloseFriendsOnly?: boolean;
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    caption?: string | null; 
    images: { id: string; url: string }[];
    createdAt: string; 
    mentions: { userId: string; username: string }[]; 
    isCloseFriendsOnly: boolean;
  };
}

export interface PostResponse {
  id: string;
  caption?: string | null | undefined;
  images: { id: string; url: string }[];
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
  isOwner: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  mentions: { userId: string; username: string }[];
  hashtags: string[];
  isCloseFriendsOnly: boolean; 
}

export interface PostApiResponse {
  success: boolean;
  message: string;
  data?: PostResponse;
}

export interface UserPostsResponse {
  success: boolean;
  message: string;
  data?: {
    user: { id: string; username: string; firstname: string | null; lastname: string | null; avatar: string | null };
    posts: PostResponse[];
    total: number;
  };
}