import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly prisma: PrismaService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        // 1. Extract from Header
        let tenantIdStr = req.headers['x-tenant-id'] as string;

        // 2. Extract from Subdomain if header is missing
        if (!tenantIdStr) {
            const host = req.headers.host || '';
            const parts = host.split('.');
            if (parts.length > 2) {
                // Example: tenant1.localhost:3000 -> tenant1
                // This is a simplified check for dev. In prod with real domains: acme.app.com -> acme
                const subdomain = parts[0];

                // For this demo, we assume subdomain matches tenant name or we look it up
                const tenant = await this.prisma.tenant.findFirst({
                    where: { name: { equals: subdomain, mode: 'insensitive' } }
                });
                if (tenant) {
                    tenantIdStr = tenant.id.toString();
                }
            }
        }

        if (tenantIdStr) {
            const tenantId = parseInt(tenantIdStr, 10);
            if (isNaN(tenantId)) {
                throw new BadRequestException('Invalid Tenant ID');
            }

            // Attach to request
            req['tenantId'] = tenantId;
        }

        next();
    }
}
