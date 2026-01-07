import { Role } from '../common/constants/roles.enum';

declare global {
    namespace Express {
        interface User {
            id: number;
            email: string;
            role: Role;
            tenant_id: number;
        }

        interface Request {
            user?: User;
            tenantId?: number;
        }
    }
}
