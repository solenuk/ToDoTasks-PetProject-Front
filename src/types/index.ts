export type UserRole = 'USER_ROLE' | 'ADMIN_ROLE';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}


export interface AuthResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export type FieldErrors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: string;
};