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
}

export type TaskState = 'NEW' | 'DOING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ResponseTaskDTO {
    id: number;
    title: string;
    description: string;
    state: TaskState;
    priority: TaskPriority;
    creatorId: number;
    createdAt: string;
    updatedAt: string;
    collaboratorIds: number[];
}

export interface PaginatedResponseDTO<T> {
    content: T[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface UpdateTaskDTO {
    title: string;
    description?: string;
    state: TaskState;
    priority: TaskPriority;
}