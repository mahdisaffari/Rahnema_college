export interface FollowResponse {
  success: boolean;
  message: string;
  data?: { followed: boolean };
}