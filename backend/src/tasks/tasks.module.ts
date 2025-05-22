import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { UserSchema } from 'src/auth/schemas/user.schema';
import { TeamModule } from 'src/teams/team.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), 
    NotificationsModule,
    TeamModule,
    CommentsModule

  ],

  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
