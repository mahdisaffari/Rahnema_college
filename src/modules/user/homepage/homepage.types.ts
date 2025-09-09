export interface HomepageResponse {
  success: boolean;
  message: string;
  data: {
    posts: HomepagePostResponse[];
    total: number;
  };
}

export interface HomepagePostResponse {
  id: string;
  caption: string | null;
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
    followerCount: number;
  };
  isOwner: boolean;
  mentions?: { userId: string; username: string }[];
  hashtags?: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}