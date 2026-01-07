import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import * as bcrypt from 'bcrypt';
import {
    sanitizeUser,
    sanitizeUsers,
    decodeCursor,
    createCursorPaginationMeta,
} from '../common/utils/sanitization.util';

@Injectable()
export class UsersService {
    private readonly SALT_ROUNDS = 10;

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new user with hashed password within a specific tenant
     */
    async create(createUserDto: CreateUserDto, tenant_id: number) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const password_hash = await bcrypt.hash(
            createUserDto.password,
            this.SALT_ROUNDS,
        );

        // Create user with explicit tenant_id from context
        const user = await this.prisma.user.create({
            data: {
                tenant_id,
                email: createUserDto.email,
                name: createUserDto.name,
                password_hash,
                role: createUserDto.role,
            },
        });

        return sanitizeUser(user);
    }

    /**
   * Find all users with cursor-based pagination and filtering within a tenant
   */
    async findAll(queryDto: QueryUsersDto, tenant_id: number) {
        const { cursor, limit = 10, role } = queryDto;

        // Build where clause - always force tenant_id
        const where: any = { tenant_id };
        if (role) where.role = role;

        // Decode cursor if provided
        let cursorCondition: any = {};
        if (cursor) {
            try {
                const decodedCursor = decodeCursor(cursor);
                cursorCondition = {
                    id: decodedCursor.id,
                };
            } catch (error) {
                throw new BadRequestException('Invalid cursor format');
            }
        }

        // Fetch one extra item to determine if there are more results
        const users = await this.prisma.user.findMany({
            where,
            take: limit + 1,
            ...(cursor && {
                skip: 1, // Skip the cursor item itself
                cursor: cursorCondition,
            }),
            orderBy: { created_at: 'desc' },
        });

        // Create pagination metadata
        const meta = createCursorPaginationMeta(users, limit + 1, limit);

        return {
            data: sanitizeUsers(users.slice(0, limit)),
            meta,
        };
    }

    /**
     * Find one user by ID within a specific tenant
     */
    async findOne(id: number, tenant_id: number) {
        const user = await this.prisma.user.findFirst({
            where: { id, tenant_id },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return sanitizeUser(user);
    }

    /**
     * Update a user within a specific tenant
     */
    async update(id: number, updateUserDto: UpdateUserDto, tenant_id: number) {
        // Ensure user exists within the specified tenant
        const existingUser = await this.prisma.user.findFirst({
            where: { id, tenant_id },
        });

        if (!existingUser) {
            throw new NotFoundException(`User with ID ${id} not found in tenant ${tenant_id}`);
        }

        // If email is being updated, check for conflicts
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailConflict = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });

            if (emailConflict) {
                throw new ConflictException('Email already in use');
            }
        }

        // Prepare update data
        const updateData: any = {
            email: updateUserDto.email,
            name: updateUserDto.name,
            role: updateUserDto.role,
        };

        // Hash new password if provided
        if (updateUserDto.password) {
            updateData.password_hash = await bcrypt.hash(
                updateUserDto.password,
                this.SALT_ROUNDS,
            );
        }

        // Update user, ensuring it's within the correct tenant
        const user = await this.prisma.user.update({
            where: { id, tenant_id },
            data: updateData,
        });

        return sanitizeUser(user);
    }

    /**
     * Remove a user within a specific tenant
     */
    async remove(id: number, tenant_id: number) {
        // Ensure user exists within the specified tenant before attempting to delete
        await this.findOne(id, tenant_id);

        // Delete user (hard delete for now, can be changed to soft delete)
        await this.prisma.user.delete({
            where: { id },
        });

        return {
            message: `User with ID ${id} has been deleted successfully`,
        };
    }

    /**
     * Find user by email (for authentication)
     */
    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
}
