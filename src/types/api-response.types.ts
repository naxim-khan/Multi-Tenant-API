export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    meta?: CursorPaginationMeta;
    timestamp: string;
}

export interface CursorPaginationMeta {
    limit: number;
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
    count: number;
}

export interface ErrorResponse {
    success: false;
    message: string;
    errors?: ValidationError[];
    timestamp: string;
    path?: string;
    statusCode?: number;
}

export interface ValidationError {
    field: string;
    constraints: string[];
}
