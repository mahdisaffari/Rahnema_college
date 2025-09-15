export interface SearchPostsQuery {
  q: string; // hashtag ha masalan(#fun+#travel)
  page: number; 
  limit: number; 
}
export interface SearchPostsResponse {
  success: boolean;
  data: {
    posts: Array<{
      id: string;
      images: string[];
      likeCount: number; 
      user: {
        id: string;
        username: string;
        avatar: string | null;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
    };
  };
  message: string;
}