import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './schema/team.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ProfileModule
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [MongooseModule],
})
export class TeamModule {}
