// src/team/team.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { HydratedDocument, Model, Types } from 'mongoose';
  import { Team } from './schema/team.schema';
  import { User, UserRole } from '../auth/schemas/user.schema';
  import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';
  
  
  @Injectable()
  export class TeamService {
    constructor(
      @InjectModel(Team.name) private readonly teamModel: Model<Team>,
      @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}
  
    async createTeam(dto: CreateTeamDto, currentUser: HydratedDocument<User>) {
      if (currentUser.role !== UserRole.TEAM_LEAD) {
        throw new ForbiddenException('Only team leads can create teams');
      }
    
      console.log('✅ Step 1: Starting team creation');
    
      const members = await Promise.all(
        dto.members.map(async (email) => {
          const user = await this.userModel.findOne({ email });
          if (!user) throw new NotFoundException(`User with email ${email} not found`);
          if (user.role !== UserRole.USER) throw new BadRequestException(`${email} is not a user`);
          if (user.team) throw new BadRequestException(`${email} already in a team`);
          return user;
        }),
      );
    
      console.log('✅ Step 2: Members found', members.map(m => ({
        id: m._id,
        name: m.name,
        email: m.email
      })));
    
      const team = await this.teamModel.create({
        name: dto.name,
        description: dto.description,
        teamLeader: currentUser._id,
        members: members.map((u) => u._id),
      });
    
      console.log('✅ Step 3: Team created', (team._id as Types.ObjectId).toString());
    
      await Promise.all(
        members.map((user) => {
          user.team = team._id as Types.ObjectId;
          user.teamLeader = currentUser._id as Types.ObjectId;
          return user.save();
        }),
      );
    
      currentUser.team = team._id as Types.ObjectId;
      await currentUser.save();
    
      console.log('✅ Step 4: Users updated with team');
    
      // استخدام Aggregation Pipeline بدلاً من populate
      const populatedTeam = await this.teamModel.aggregate([
        { $match: { _id: new Types.ObjectId(team._id as string) } },
        {
          $lookup: {
            from: 'users',
            localField: 'teamLeader',
            foreignField: '_id',
            as: 'teamLeader',
          },
        },
        { $unwind: '$teamLeader' },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members',
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            teamLeader: { _id: 1, name: 1, email: 1, image: 1 },
            members: { _id: 1, name: 1, email: 1, image: 1 },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
    
      console.log('✅ Step 5: Populated team', JSON.stringify(populatedTeam, null, 2));
    
      return populatedTeam;
    }
    
    
      
      
    
  
    async updateTeam(id: string, dto: UpdateTeamDto, currentUser: User) {
      const team = await this.teamModel.findById(id);
      if (!team) throw new NotFoundException('Team not found');
  
      if (team.teamLeader.toString() !==( currentUser._id as Types.ObjectId) .toString()) {
        throw new ForbiddenException('Only the team leader can update this team');
      }
  
      if (dto.members) {
        await this.userModel.updateMany(
          { _id: { $in: team.members } },
          { $unset: { team: '', teamLeader: '' } },
        );
  
        const newMembers = await Promise.all(
          dto.members.map(async (email) => {
            const user = await this.userModel.findOne({ email });
            if (!user) throw new NotFoundException(`User with email ${email} not found`);
            if (user.role !== UserRole.USER) throw new BadRequestException(`${email} is not a user`);
            return user;
          }),
        );
  
        team.members  = newMembers.map((u) => u._id) as Types.ObjectId[];
        await Promise.all(
          newMembers.map((user) => {
            user.team = team._id as Types.ObjectId;
            user.teamLeader = currentUser._id as Types.ObjectId;
            return user.save();
          }),
        );
      }
  
      if (dto.name) team.name = dto.name;
      if (dto.description) team.description = dto.description;
  
      return team.save();
    }
  
    async deleteTeam(id: string, currentUser: User) {
      const team = await this.teamModel.findById(id);
      if (!team) throw new NotFoundException('Team not found');
  
      if (team.teamLeader.toString() !== (currentUser._id as Types.ObjectId).toString()) {
        throw new ForbiddenException('Only the team leader can delete this team');
      }
  
      await this.userModel.updateMany(
        { team: team._id },
        { $unset: { team: '', teamLeader: '' } },
      );
  
      await team.deleteOne();
      return { message: 'Team deleted successfully' };
    }
  
    async getMyTeam(currentUser: User): Promise<Team> {
      if (!currentUser.team) {
       null
      }
      
  
      const team = await this.teamModel.aggregate([
        { $match: { _id: currentUser.team } }, 
        {
          $lookup: {
            from: 'users', 
            localField: 'members', 
            foreignField: '_id', 
            as: 'membersDetails',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'teamLeader', 
            foreignField: '_id',
            as: 'teamLeaderDetails',
          },
        },
        {
          $project: {
            name: 1,
            description: 1, // ✅ أضف ده هنا
            teamLeader: { $arrayElemAt: ['$teamLeaderDetails', 0] },
            createdAt: 1,
            updatedAt: 1,
            members: {
              $map: {
                input: "$membersDetails",
                as: "member",
                in: {
                  _id: "$$member._id",
                  name: "$$member.name",
                  email: "$$member.email",
                  image: "$$member.image"
                }
              }
            }
          }
          
        },
      ]);
      
      if (team.length === 0) {
        null
      }
  
      return team[0];
    }
  
    async checkUser(email: string) {
      const user = await this.userModel.findOne({ email });
      if (!user || user.role !== UserRole.USER) return null;
  
      return {
        email: user.email,
        name: user.name,
        isFree: !user.team,
      };
    }
  }
  