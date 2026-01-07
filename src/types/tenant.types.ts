export interface TenantContext {
    tenantId: number;
}

export interface CreateTenantDto {
    name: string;
    adminEmail: string;
    adminPassword: string;
}
