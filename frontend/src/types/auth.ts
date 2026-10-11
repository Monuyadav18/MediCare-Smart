
export type Role = "PATIENT" | "DOCTOR" | "ADMIN";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    jwt: string;
    userId: number;
    roles: Role[];
}

export interface SignUpRequest {
    username: string;
    password: string;
    name: string;
    roles: Role[];
}

export interface SignupResponse {
    id: number;
    username: string;
}

export interface ApiError {
    message?: string;
    error?: string;
    status?: number;
}
