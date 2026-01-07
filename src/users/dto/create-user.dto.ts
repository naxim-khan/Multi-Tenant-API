import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/constants/roles.enum';

export class CreateUserDto {
    @IsInt()
    @IsNotEmpty()
    tenant_id: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @IsNotEmpty()
    password: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
