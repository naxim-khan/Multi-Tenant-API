import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../types/api-response.types';

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data) => {
                // If data is already formatted as ApiResponse, return it
                if (data && typeof data === 'object' && 'success' in data) {
                    return data;
                }

                // Check if data contains pagination metadata
                if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
                    return {
                        success: true,
                        data: data.data,
                        meta: data.meta,
                        timestamp: new Date().toISOString(),
                    };
                }

                // Standard response wrapping
                return {
                    success: true,
                    data,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
}
