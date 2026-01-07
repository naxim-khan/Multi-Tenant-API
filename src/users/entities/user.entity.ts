import { Role } from '../../common/constants/roles.enum';

export class UserEntity {
    id: number;
    tenant_id: number;
    email: string;
    name?: string;
    role: Role;
    created_at: Date;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
