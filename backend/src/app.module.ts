import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/user.module';
import {ProfileModule} from './profile/profile.module';
import { TeamModule } from './teams/team.module';
import { NotificationsModule } from './notifications/notifications.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');
        return { uri: mongoUri };
      },
    }),
    AuthModule,
    TasksModule,
    UsersModule,
    ProfileModule,
    TeamModule,
    NotificationsModule,
    
  ],
})
export class AppModule {}
