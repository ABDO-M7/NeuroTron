import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Controller('exams')
export class ExamsController {
    constructor(private examsService: ExamsService) { }

    @Get()
    findAll(@Query('subjectId') subjectId?: string) {
        return this.examsService.findAll(subjectId ? parseInt(subjectId) : undefined);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.examsService.findOne(id);
    }

    @Get(':id/student')
    @UseGuards(AuthGuard('jwt'))
    findOneForStudent(@Param('id', ParseIntPipe) id: number) {
        return this.examsService.findOneForStudent(id);
    }

    @Get(':id/results')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    getResults(@Param('id', ParseIntPipe) id: number) {
        return this.examsService.getResults(id);
    }

    @Get(':id/stats')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    getStats(@Param('id', ParseIntPipe) id: number) {
        return this.examsService.getStats(id);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    create(@Body() dto: CreateExamDto) {
        return this.examsService.create(dto);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExamDto) {
        return this.examsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.examsService.remove(id);
    }
}
