// src/team/team.service.ts
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import {  Model, Types } from 'mongoose';
  import { Team } from './schema/team.schema';
  import { User, UserRole } from '../auth/schemas/user.schema';
  import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';
  
  
  @Injectable()
  export class TeamService {
    constructor(
      @InjectModel(Team.name) private readonly teamModel: Model<Team>,
      @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}
  
    async createTeam(dto: CreateTeamDto, currentUser: { userId: string; role: string }) {
      if (currentUser.role !== UserRole.TEAM_LEAD) {
        throw new ForbiddenException('Only team leads can create teams');
      }
    
      const userDoc = await this.userModel.findById(currentUser.userId);
      if (!userDoc) throw new NotFoundException('User not found');
    
      const members = await Promise.all(
        dto.members.map(async (email) => {
          const user = await this.userModel.findOne({ email });
          if (!user) throw new NotFoundException(`User with email ${email} not found`);
          if (user.role !== UserRole.USER) throw new BadRequestException(`${email} is not a user`);
          if (user.team) throw new BadRequestException(`${email} already in a team`);
          return user;
        }),
      );
    
      const team = await this.teamModel.create({
        name: dto.name,
        description: dto.description,
        teamLeader: userDoc._id,
        members: members.map((u) => u._id),
      });
    
      await Promise.all(
        members.map((user) => {
          user.team = team._id as Types.ObjectId;
          user.teamLeader = userDoc._id as Types.ObjectId;
          
          return user.save();
        }),
      );
    
      userDoc.team = team._id as Types.ObjectId;

      await userDoc.save();
    
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
    
      return populatedTeam;
    }
    
      
      
    
  
    async updateTeam(id: string, dto: UpdateTeamDto, currentUser: User  | any) {
      const team = await this.teamModel.findById(id);
      if (!team) throw new NotFoundException('Team not found');
    
      if (team.teamLeader.toString() !== currentUser.userId.toString()) {
        throw new ForbiddenException('Only the team leader can update this team');
      }
    
      if (Array.isArray(dto.members)) {
        const currentMembers = team.members || [];
    
        if (currentMembers.length > 0) {
          await this.userModel.updateMany(
            { _id: { $in: currentMembers } },
            { $unset: { team: '', teamLeader: '' } },
          );
        }
    
        if (dto.members.length > 0) {
          const newMembers: User[] = await Promise.all(
            dto.members.map(async (email) => {
              const user = await this.userModel.findOne({ email });
              if (!user) throw new NotFoundException(`User with email ${email} not found`);
              return user;
            }),
          );
    
          team.members = newMembers.map((u) => u._id as Types.ObjectId);
    
          await Promise.all(
            newMembers.map((user) => {
              user.team = team._id as Types.ObjectId;
              user.teamLeader = currentUser.userId as Types.ObjectId;  
              return user.save();
            }),
          );
        } else {
          team.members = [];
        }
      }
    
      if (dto.name) team.name = dto.name;
      if (dto.description) team.description = dto.description;
    
      return team.save();
    }
    
  
    async deleteTeam(id: string, currentUser: User | any) {
      const team = await this.teamModel.findById(id);
      if (!team) throw new NotFoundException('Team not found');
    
      if (team.teamLeader.toString() !== currentUser.userId) {
        throw new ForbiddenException('Only the team leader can delete this team');
      }
    
      await this.userModel.updateMany(
        { team: team._id },
        { $unset: { team: '', teamLeader: '' } },
      );
    
      await team.deleteOne();
      return { message: 'Team deleted successfully' };
    }
    
  
    async getMyTeam(currentUser: User): Promise<Team | null> {
      if (!currentUser.team) {
        return null;
      }
    
      const team = await this.teamModel.aggregate([
        { $match: { _id: currentUser.team } },
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
            createdAt: 1,
            updatedAt: 1,
            teamLeader: {
              _id: 1,
              name: 1,
              email: 1,
              image: 1,
            },
            members: {
              _id: 1,
              name: 1,
              email: 1,
              image: 1,
            },
          },
        },
      ]);
    
      if (team.length === 0) {
        return null;
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

    async getMyTeamMembersIfTeamLead(currentUser: User) {
      if (!currentUser.team) {
        throw new NotFoundException('No team found');
      }
    
      const team = await this.teamModel.aggregate([
        { $match: { _id: new Types.ObjectId(currentUser.team) } },
        {
          $lookup: {
            from: 'users', 
            localField: 'members',
            foreignField: '_id', 
            as: 'membersDetails', 
          }
        },
        {
          $project: {
            membersDetails: {
              _id: 1,
              name: 1, 
              email: 1 
            }
          }
        }
      ]);
    
      if (!team || team.length === 0) {
        throw new NotFoundException('Team not found');
      }
    
      return team[0].membersDetails; 
    }
    
    
    
    
  }
  