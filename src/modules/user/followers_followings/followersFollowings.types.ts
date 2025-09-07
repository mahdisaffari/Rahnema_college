export interface FollowerFollowingResponse {
    username: string;
    avatar: string | null;
}

export interface FollowListApiResponse {
    success: boolean;
    message: string;
    data?: FollowerFollowingResponse[];
}