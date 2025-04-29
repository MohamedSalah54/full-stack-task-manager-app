// src/notifications/notifications.controller.ts
import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/Decorator/roles.decorator';
import { UserRole } from 'src/auth/schemas/user.schema';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateNotificationDto) {
        return this.notificationsService.create(dto);
    }

    @Get(':userId')
    findAllByUser(
        @Param('userId') userId: string,
        @Query('unreadOnly') unreadOnly?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        const onlyUnread = unreadOnly === 'true';
        return this.notificationsService.findAllByUser(userId, onlyUnread, parseInt(page), parseInt(limit));
    }

    @Patch('read/:id')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Patch('read-all/:userId')
    markAllAsRead(@Param('userId') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }
    @Roles(UserRole.ADMIN)
    @Get()
    getAllNotifications(@Query('limit') limit = '5') {
        return this.notificationsService.findAllNotifications(parseInt(limit));
    }
}
