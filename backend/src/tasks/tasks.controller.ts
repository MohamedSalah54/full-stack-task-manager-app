import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UsePipes, ValidationPipe, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: RequestWithUser): Promise<Task> {
    const userId = req.user.userId;
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  findAll(@Query('category') category: string, @Req() req: RequestWithUser): Promise<Task[]> {
    const userId = req.user.userId;
    return this.tasksService.findAll(userId, category);
  }

  @Get('/team/all')
  getAllTasksForTeam(@Query('teamId') teamId: string): Promise<Task[]> {
    return this.tasksService.findAllTasksForTeamLead(teamId);
  }
  


  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Task> {
    const userId = req.user.userId;
    return this.tasksService.findOne(id, userId);
  }
  

  @Patch(':id/toggle-complete')
  toggleComplete(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Task> {
    const userId = req.user.userId;
    return this.tasksService.toggleComplete(id, userId);
  }



  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: RequestWithUser): Promise<Task> {
    const userId = req.user.userId;
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Task> {
    const userId = req.user.userId;
    return this.tasksService.remove(id, userId);
  }
}
