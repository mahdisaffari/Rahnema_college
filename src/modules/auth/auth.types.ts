export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface LoginRequest {
  identifier: string; // username or email
  password: string;
  rememberMe?: boolean; 
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  refresh?: string;
  username?: string; 
}