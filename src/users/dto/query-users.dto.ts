import { IsOptional, IsInt, IsEnum, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../common/constants/roles.enum';

export class QueryUsersDto {
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tenant_id?: number;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
