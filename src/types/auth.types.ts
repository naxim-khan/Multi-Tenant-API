import { Role } from '../common/constants/roles.enum';

export interface JwtPayload {
    sub: number;
    email: string;
    role: Role;
    tenant_id: number;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        email: string;
        role: Role;
    };
}
