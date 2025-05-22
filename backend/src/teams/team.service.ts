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
import { Profile } from 'src/profile/schema/profile.schema';
  
  
  @Injectable()
  export class TeamService {
    constructor(
      @InjectModel(Team.name) private readonly teamModel: Model<Team>,
      @InjectModel(User.name) private readonly userModel: Model<User>,
      @InjectModel('Profile') private readonly profileModel: Model<Profile>, 

    ) {}
    async createTeam(dto: CreateTeamDto, currentUser: { userId: string; role: UserRole }) {
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
          user.teamName = team.name;
          user.teamLeaderName = userDoc.name;
          return user.save();
        }),
      );
    
      userDoc.team = team._id as Types.ObjectId;
      userDoc.teamName = team.name;
      userDoc.teamLeaderName = userDoc.name;
      await userDoc.save();
    
      console.log('🔁 Updating team lead profile...');
      const updatedLeadProfile = await this.profileModel.findOneAndUpdate(
        { userId: userDoc._id },
        {
          team: team.name,
          teamLead: userDoc.name,
        },
        { new: true }
      );
    
      if (!updatedLeadProfile) {
        console.log('⚠️ Team lead profile not found, creating new one...');
        await this.profileModel.create({
          userId: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          team: team.name,
          teamLead: userDoc.name,
          profileImage: userDoc.image,
          position: userDoc.position,
        });
      } else {
      }
    
      await Promise.all(
        members.map(async (member) => {
          console.log(`🔍 Updating profile for member: ${member.email}`);
          const updated = await this.profileModel.findOneAndUpdate(
            { userId: member._id },
            {
              team: team.name,
              teamLead: userDoc.name,
            },
            { new: true }
          );
    
          if (!updated) {
            console.log(`⚠️ Profile not found for ${member.email}, creating...`);
            await this.profileModel.create({
              userId: member._id,
              name: member.name,
              email: member.email,
              role: member.role,
              team: team.name,
              teamLead: userDoc.name,
              profileImage: member.image,
              position: member.position,
            });
          } else {
            console.log(`✅ Profile updated for ${member.email}`);
          }
        })
      );
    
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
            teamLeader: {
              _id: "$teamLeader._id",
              name: "$teamLeader.name",
              email: "$teamLeader.email",
              image: "$teamLeader.image",
              position: "$teamLeader.position",
            },
            members: {
              $map: {
                input: "$members",
                as: "member",
                in: {
                  _id: "$$member._id",
                  name: "$$member.name",
                  email: "$$member.email",
                  image: "$$member.image",
                  position: "$$member.position",
                },
              },
            },
            teamLeaderName: "$teamLeader.name",
            teamName: "$name",
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
    
      console.log('✅ Team created successfully with updated profiles.');
      return populatedTeam;
    }
    
    
    
    
      
      
    
    async updateTeam(
      teamId: string,
      dto: UpdateTeamDto,
      currentUser: { userId: string; role: string },
    ) {
      if (currentUser.role !== UserRole.TEAM_LEAD) {
        throw new ForbiddenException('Only team leads can update teams');
      }
    
      const userDoc = await this.userModel.findById(currentUser.userId);
      if (!userDoc) throw new NotFoundException('User not found');
    
      const team = await this.teamModel.findById(teamId);
      if (!team) throw new NotFoundException('Team not found');
    
      const members = dto.members
        ? await Promise.all(
            dto.members.map(async (email) => {
              const user = await this.userModel.findOne({ email });
              if (!user) throw new NotFoundException(`User with email ${email} not found`);
    
              if (user.role === UserRole.TEAM_LEAD) {
                throw new BadRequestException(`Cannot add a team lead to this team`);
              }
    
              if (user.role !== UserRole.USER) {
                throw new BadRequestException(`${email} is not a user`);
              }
    
              if (user.team && user.team.toString() !== teamId) {
                throw new BadRequestException(`${email} already in a different team`);
              }
    
              return user;
            }),
          )
        : [];
    
      if (dto.name) team.name = dto.name;
      if (dto.description) team.description = dto.description;
    
      team.teamLeader = userDoc._id as Types.ObjectId;
      team.members = members.map((u) => u._id as Types.ObjectId);
    
      await team.save();
    
      const currentMembers = await this.userModel.find({ 
        team: team._id,
        _id: { $ne: userDoc._id } 
      });
    
      const removedMembers = currentMembers.filter((user) => {
        return !members.find((m) =>( m._id as Types.ObjectId).toString() === (user._id as Types.ObjectId).toString());
      });
    
    
      await Promise.all(
        removedMembers.map(async (user) => {
          user.team = null;
          user.teamLeader = null;
          user.teamName = '';
          user.teamLeaderName = '';
          await user.save();
    
          const updated = await this.profileModel.findOneAndUpdate(
            { userId: user._id },
            {
              team: '',
              teamLead: '',
            },
            { new: true }
          );
    
          if (!updated) {
            console.log(`Creating profile for removed member: ${user.email}`);
            await this.profileModel.create({
              userId: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              team: '',
              teamLead: '',
              profileImage: user.image,
              position: user.position,
            });
          }
        })
      );
    
      await Promise.all(
        members.map(async (user) => {
          user.team = team._id as Types.ObjectId;
          user.teamLeader = userDoc._id as Types.ObjectId;
          user.teamName = team.name;
          user.teamLeaderName = userDoc.name;
          await user.save();
    
          const updated = await this.profileModel.findOneAndUpdate(
            { userId: user._id },
            {
              team: team.name,
              teamLead: userDoc.name,
            },
            { new: true }
          );
    
          if (!updated) {
            console.log(`Creating profile for added member: ${user.email}`);
            await this.profileModel.create({
              userId: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              team: team.name,
              teamLead: userDoc.name,
              profileImage: user.image,
              position: user.position,
            });
          }
        })
      );
    
      userDoc.team = team._id as Types.ObjectId;
      userDoc.teamName = team.name;
      userDoc.teamLeaderName = userDoc.name;
      await userDoc.save();
    
      await this.profileModel.findOneAndUpdate(
        { userId: userDoc._id },
        {
          team: team.name,
          teamLead: userDoc.name,
        },
        { new: true }
      );
    
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
            teamLeader: {
              _id: "$teamLeader._id",
              name: "$teamLeader.name",
              email: "$teamLeader.email",
              image: "$teamLeader.image",
            },
            members: {
              $map: {
                input: "$members",
                as: "member",
                in: {
                  _id: "$$member._id",
                  name: "$$member.name",
                  email: "$$member.email",
                  image: "$$member.image",
                },
              },
            },
            teamLeaderName: "$teamLeader.name",
            teamName: "$name",
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
    
      return populatedTeam[0];
    }
    
    
    
    
    
    
  

    
    async deleteTeam(id: string, currentUser: User | any) {
      const team = await this.teamModel.findById(id);
      if (!team) throw new NotFoundException('Team not found');
    
      if (team.teamLeader.toString() !== currentUser.userId) {
        throw new ForbiddenException('Only the team leader can delete this team');
      }
    
      await Promise.all(
        team.members.map(async (memberId) => {
          const user = await this.userModel.findById(memberId);
          if (user) {
            user.team = null;
            user.teamLeader = null;
            user.teamName = '';
            user.teamLeaderName = '';
            await user.save();
    
            const updated = await this.profileModel.findOneAndUpdate(
              { userId: user._id },
              {
                team: '',
                teamLead: '',
              },
              { new: true }
            );
    
            if (!updated) {
              await this.profileModel.create({
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                team: '',
                teamLead: '',
                profileImage: user.image,
                position: user.position,
              });
            }
          }
        })
      );
    
      const teamLeader = await this.userModel.findById(team.teamLeader);
      if (teamLeader) {
        teamLeader.team = null;
        teamLeader.teamLeader = null;
        teamLeader.teamName = '';
        teamLeader.teamLeaderName = '';
        await teamLeader.save();
    
        const updatedLeader = await this.profileModel.findOneAndUpdate(
          { userId: teamLeader._id },
          {
            team: '',
            teamLead: '',
          },
          { new: true }
        );
    
        if (!updatedLeader) {
          await this.profileModel.create({
            userId: teamLeader._id,
            name: teamLeader.name,
            email: teamLeader.email,
            role: teamLeader.role,
            team: '',
            teamLead: '',
            profileImage: teamLeader.image,
            position: teamLeader.position,
          });
        }
      }
    
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
              position:1
            },
            members: {
              _id: 1,
              name: 1,
              email: 1,
              image: 1,
              position:1
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
    
    async findAll() {
      return this.teamModel.aggregate([
        {
          $lookup: {
            from: 'users', 
            localField: 'teamLeader',
            foreignField: '_id',
            as: 'teamLeader',
          },
        },
        {
          $unwind: {
            path: '$teamLeader',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: '_id',
            as: 'members',
          },
        },
        {
          $lookup: {
            from: 'tasks',
            localField: 'tasks',
            foreignField: '_id',
            as: 'tasks',
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            createdAt: 1,
            updatedAt: 1,
            teamLeader: { name: 1, email: 1, image: 1 },
            members: { name: 1, email: 1, image: 1 },
            tasks: 1,
          },
        },
      ]);
    }
    
    
    
  }
  