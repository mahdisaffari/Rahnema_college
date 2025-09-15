export interface BookmarkedPostAuthorDto {
  id: string;
  username: string | null;
  avatar: string | null;
}

export interface BookmarkedPostItemDto {
  bookmarkId: string;
  createdAt: string;
  post: {
    id: string;
    caption: string | null;
    thumbnail: string | null;
    author: BookmarkedPostAuthorDto;
  };
}

export interface BookmarkedPostsResponseDto {
  success: boolean;
  message: string;
  data: {
    items: BookmarkedPostItemDto[];
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
  };
}
