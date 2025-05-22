// src/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schema/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';


@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly gateway: NotificationsGateway,

  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const newNotification = new this.notificationModel(dto);
    const saved = await newNotification.save();
  
    this.gateway.sendNotificationToUser(dto.userId, saved);
  
    return saved;
  }

  async findAllByUser(userId: string, unreadOnly?: boolean, page = 1, limit = 10): Promise<Notification[]> {
    const query: any = { userId };
    if (unreadOnly) query.isRead = false;

    return this.notificationModel
      .find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id);
    if (!notification) throw new NotFoundException('Notification not found');
  
    notification.isRead = true;
    const updated = await notification.save();
  
    this.gateway.sendNotificationToUser(notification.userId, {
      type: 'read',
      notificationId: updated._id,
    });
  
    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    );
  
    this.gateway.sendNotificationToUser(userId, {
      type: 'readAll',
    });
  
    return { modifiedCount: result.modifiedCount };
  }

  async findAllNotifications(limit = 5): Promise<Notification[]> {
    return this.notificationModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
  
}
