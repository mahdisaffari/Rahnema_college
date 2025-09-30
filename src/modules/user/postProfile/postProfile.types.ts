export interface PostResponseData {
  id: string;
  caption: string | null;
  images: { url: string }[];
  likeCount: number;
  bookmarkCount: number;
  isCloseFriendsOnly: boolean;
  createdAt: string;
}

export interface getPostProfileApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}