export interface BlockActionResponse {
  success: boolean;
  message: string;
  data?: { blocked: boolean };
}

export interface BlockedUsersListResponse {
  success: boolean;
  message: string;
  data?: { id: string; username: string; avatar: string | null }[];
}


