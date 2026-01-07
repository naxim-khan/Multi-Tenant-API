import { PrismaClient } from '../src/generated/client/client';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/common/constants/roles.enum';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database... (TS Mode)');

    // 1. Create Tenant
    const tenantName = 'Acme Corp';
    let tenant = await prisma.tenant.findFirst({
        where: { name: tenantName },
    });

    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: tenantName,
            },
        });
        console.log(`Created tenant: ${tenant.name} (ID: ${tenant.id})`);
    } else {
        console.log(`Tenant already exists: ${tenant.name} (ID: ${tenant.id})`);
    }

    // 2. Create Admin User
    const adminEmail = 'admin@acmecorp.com';
    let user = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'System Admin',
                password_hash: hashedPassword,
                role: Role.ADMIN,
                tenant_id: tenant.id,
            },
        });
        console.log(`Created admin user: ${user.email} (ID: ${user.id})`);
    } else {
        console.log(`Admin user already exists: ${user.email} (ID: ${user.id})`);
    }

    // 3. Create a Project
    const projectName = 'Website Redesign';
    let project = await prisma.project.findFirst({
        where: {
            name: projectName,
            tenant_id: tenant.id
        },
    });

    if (!project) {
        project = await prisma.project.create({
            data: {
                name: projectName,
                tenant_id: tenant.id,
                owner_id: user.id
            }
        });
        console.log(`Created project: ${project.name} (ID: ${project.id})`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
