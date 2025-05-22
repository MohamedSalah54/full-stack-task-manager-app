import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';
import { JwtAuthGuard as AuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/Decorator/roles.decorator';
import { UserRole } from 'src/auth/schemas/user.schema';

@Controller('teams')
@UseGuards(AuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) { }

  @Post('create')
  createTeam(@Body() dto: CreateTeamDto, @Req() req: any) {
    console.log('USER FROM JWT:', req.user);

    return this.teamService.createTeam(dto, req.user);
  }

  @Put(':id')
  updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto, @Req() req: any) {
    return this.teamService.updateTeam(id, dto, req.user);
  }

  @Delete(':id')
  deleteTeam(@Param('id') id: string, @Req() req: any) {
    return this.teamService.deleteTeam(id, req.user);
  }
  

  @Get('my-team')
  async getMyTeam(@Req() req: any) {
    const team = await this.teamService.getMyTeam(req.user);
    if (!team) {
      return { team: null, message: 'No team found' };
    }
    return { team };
  }

  @Get('my-members')
  @UseGuards(new AuthGuard('jwt')) 
  async getMyTeamMembers(@Req() req: any) {
    const members = await this.teamService.getMyTeamMembersIfTeamLead(req.user);
  
    return { members };
  }



  @Get('check-user')
  checkUser(@Query('email') email: string) {
    return this.teamService.checkUser(email);
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  getAllTeams() {
    return this.teamService.findAll(); 
}
}
