import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user within the current tenant' })
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body() createUserDto: CreateUserDto,
        @GetCurrentUser('tenant_id') tenantId: number,
    ) {
        return this.usersService.create(createUserDto, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users belonging to the current tenant' })
    findAll(
        @Query() queryDto: QueryUsersDto,
        @GetCurrentUser('tenant_id') tenantId: number,
    ) {
        return this.usersService.findAll(queryDto, tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific user by ID (tenant-isolated)' })
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetCurrentUser('tenant_id') tenantId: number,
    ) {
        return this.usersService.findOne(id, tenantId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user by ID (tenant-isolated)' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
        @GetCurrentUser('tenant_id') tenantId: number,
    ) {
        return this.usersService.update(id, updateUserDto, tenantId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove a user by ID (tenant-isolated)' })
    @HttpCode(HttpStatus.OK)
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetCurrentUser('tenant_id') tenantId: number,
    ) {
        return this.usersService.remove(id, tenantId);
    }
}
