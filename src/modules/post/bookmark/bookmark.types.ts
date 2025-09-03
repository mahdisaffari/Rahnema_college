export interface BookmarkResponse {
  success: boolean;
  message: string;
  data: { postId: string; userId: string; bookmarkCount: number };
}