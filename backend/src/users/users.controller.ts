import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    async getProfile(@Request() req: any) {
        const user = await this.usersService.findById(req.user.id);
        if (!user) return null;
        return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role,
            avatar: user.avatar,
            level: user.level,
            specialization: user.specialization
        };
    }

    @Patch('me/profile')
    async updateProfile(@Request() req: any, @Body() body: { name?: string; level?: string; specialization?: string; avatar?: string; }) {
        const updatedUser = await this.usersService.updateUserDetails(req.user.id, {
            name: body.name,
            level: body.level,
            specialization: body.specialization,
            avatar: body.avatar
        });
        return { 
            id: updatedUser.id, 
            email: updatedUser.email, 
            name: updatedUser.name, 
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            level: updatedUser.level,
            specialization: updatedUser.specialization,
            profileComplete: updatedUser.profileComplete
        };
    }

    @Get('me/stats')
    async getMyStats(@Request() req: any) {
        return this.usersService.getStudentStats(req.user.id);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async findAll() {
        return this.usersService.findAll();
    }
}
