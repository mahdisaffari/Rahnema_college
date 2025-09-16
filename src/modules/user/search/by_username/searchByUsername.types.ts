import { UserResponse } from "../../user.types";


export interface SearchByUsernameQuery {
  username: string;
  page: number;
  limit: number;
}

export interface SearchByUsernameResponse {
  success: boolean;
  data: {
    users: UserResponse[];
    pagination: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
    };
  };
  message: string;
}