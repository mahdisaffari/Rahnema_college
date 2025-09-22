export interface FollowRequestResponse {
  success: boolean;
  message: string;
  data?: { requestSent: boolean; status?: 'pending' | 'accepted' | 'rejected' };
}

export interface PendingRequestsResponse {
  success: boolean;
  message: string;
  data?: { id: string; requester: { id: string; username: string; avatar?: string | null } }[];
}