export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export interface CursorPaginationQuery {
    cursor?: string;
    limit?: number;
}

export interface CursorPaginationResult<T> {
    data: T[];
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
    count: number;
}

export interface DecodedCursor {
    id: number;
    created_at?: Date;
}
