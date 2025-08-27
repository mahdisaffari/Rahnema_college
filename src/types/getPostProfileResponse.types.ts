
// tarif type dade haye post
export interface PostResponseData {
  id: string;
  caption: string | null;
  images: { url: string }[];
}

export interface getPostProfileApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}