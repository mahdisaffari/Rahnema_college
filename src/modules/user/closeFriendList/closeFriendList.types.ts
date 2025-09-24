export interface CloseFriend {
    id: string;
    username: string;
    firstname: string | null;
    lastname: string | null;
    avatar: string | null;
}

export interface CloseFriendListResponse {
    success: boolean;
    message: string;
    data: CloseFriend[];
}