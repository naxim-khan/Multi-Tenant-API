import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = request['tenantId'];

        if (!user || !user.tenant_id) {
            throw new ForbiddenException('User tenant context not found');
        }

        // If the route has a tenant context (from header/subdomain), it MUST match the user's tenant
        if (tenantId && user.tenant_id !== tenantId) {
            throw new ForbiddenException('You do not have access to this tenant');
        }

        return true;
    }
}
