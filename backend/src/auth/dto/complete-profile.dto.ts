import { IsString, MinLength, Matches } from 'class-validator';

export class CompleteProfileDto {
    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @Matches(/^[+]?[\d\s\-().]{7,20}$/, { message: 'Phone must be a valid number' })
    phone: string;

    @IsString()
    level: string;

    @IsString()
    specialization: string;
}
