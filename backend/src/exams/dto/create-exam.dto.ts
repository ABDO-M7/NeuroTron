import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
    @IsEnum(['MCQ', 'TRUE_FALSE', 'ESSAY'])
    type: string;

    @IsString()
    text: string;

    @IsOptional()
    @IsArray()
    options?: string[];

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    imageDesc?: string;

    @IsOptional()
    @IsString()
    correctAnswer?: string;

    @IsOptional()
    @IsInt()
    points?: number;

    @IsOptional()
    @IsInt()
    order?: number;
}

export class CreateExamDto {
    @IsString()
    title: string;

    @IsInt()
    subjectId: number;

    @IsInt()
    duration: number; // in minutes

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions?: CreateQuestionDto[];
}
