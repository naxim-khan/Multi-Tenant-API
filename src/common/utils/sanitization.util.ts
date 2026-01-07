/**
 * Sanitizes user object by removing sensitive fields
 * @param user - User object to sanitize
 * @returns Sanitized user object without password
 */
export function sanitizeUser<T extends { password_hash?: string }>(
    user: T,
): Omit<T, 'password_hash'> {
    if (!user) return user;

    const { password_hash, ...sanitized } = user;
    return sanitized;
}

/**
 * Sanitizes an array of user objects
 * @param users - Array of user objects
 * @returns Array of sanitized user objects
 */
export function sanitizeUsers<T extends { password_hash?: string }>(
    users: T[],
): Omit<T, 'password_hash'>[] {
    return users.map((user) => sanitizeUser(user));
}

/**
 * Excludes specified fields from an object
 * @param obj - Object to process
 * @param keys - Keys to exclude
 * @returns Object without excluded keys
 */
export function exclude<T, Key extends keyof T>(
    obj: T,
    keys: Key[],
): Omit<T, Key> {
    if (!obj) return obj;

    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}

/**
 * Encodes cursor data to base64 string
 * @param id - Record ID
 * @param created_at - Optional creation timestamp
 * @returns Base64 encoded cursor
 */
export function encodeCursor(id: number, created_at?: Date): string {
    const cursorData = { id, created_at: created_at?.toISOString() };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
}

/**
 * Decodes base64 cursor to object
 * @param cursor - Base64 encoded cursor
 * @returns Decoded cursor object
 */
export function decodeCursor(cursor: string): { id: number; created_at?: Date } {
    try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
        return {
            id: decoded.id,
            created_at: decoded.created_at ? new Date(decoded.created_at) : undefined,
        };
    } catch (error) {
        throw new Error('Invalid cursor format');
    }
}

/**
 * Creates cursor-based pagination metadata
 * @param items - Array of items with id and created_at
 * @param limit - Items per page
 * @param requestedLimit - Original requested limit
 * @returns Cursor pagination metadata
 */
export function createCursorPaginationMeta<T extends { id: number; created_at: Date }>(
    items: T[],
    limit: number,
    requestedLimit: number,
) {
    const hasMore = items.length > requestedLimit;
    const dataToReturn = hasMore ? items.slice(0, requestedLimit) : items;

    return {
        nextCursor: hasMore && dataToReturn.length > 0
            ? encodeCursor(
                dataToReturn[dataToReturn.length - 1].id,
                dataToReturn[dataToReturn.length - 1].created_at,
            )
            : null,
        prevCursor: dataToReturn.length > 0
            ? encodeCursor(dataToReturn[0].id, dataToReturn[0].created_at)
            : null,
        hasMore,
        count: dataToReturn.length,
        limit: requestedLimit,
    };
}
