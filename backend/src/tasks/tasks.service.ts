import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { User } from '../auth/schemas/user.schema';
import { Team } from 'src/teams/schema/team.schema';



@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    ) { }

    async create(createTaskDto: CreateTaskDto, creatorId: string): Promise<Task> {
      const creator = await this.userModel.findById(creatorId);
      if (!creator) throw new NotFoundException('Creator not found');
    
      const assignedTo = createTaskDto.assignedTo || creatorId;
    
      const newTask = new this.taskModel({
        ...createTaskDto,
        createdBy: creatorId,
        assignedTo,
        completed: false,
      });
    
      const savedTask = await newTask.save();
    
      await this.userModel.findByIdAndUpdate(
        assignedTo,
        {
          $inc: {
            'tasks.allTasks': 1,
            'tasks.completedTasks': 0,
            'tasks.incompleteTasks': 1,
          },
        }
      );
    
      const team = await this.teamModel.findOne({
        teamLeader: new Types.ObjectId(creatorId) 
      });
    
      if (!team) {
        throw new NotFoundException(`No team found for the team leader: ${creatorId}`);
      }
    
      console.log("Team found for team leader:", team);
    
      // إضافة المهمة إلى قائمة المهام في الفريق
      await this.teamModel.findByIdAndUpdate(team._id, {
        $addToSet: { tasks: savedTask._id }, 
      });
    
      const updatedTeam = await this.teamModel.findById(team._id);
      console.log("Updated Team:", updatedTeam);
    
      return savedTask;
    }
    
    
  

  async findAll(userId: string, category?: string): Promise<Task[]> {
    const matchStage: any = { assignedTo: userId };
  
    if (category) {
      matchStage.category = category;
    }
  
    const result = await this.taskModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',  
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedUser'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          dueDate: 1,
          completed: 1,
          assignedTo: {
            $cond: {
              if: { $eq: [{ $type: '$assignedTo' }, 'objectId'] },
              then: {
                $ifNull: [
                  { $arrayElemAt: ['$assignedUser.name', 0] },
                  'Unassigned'
                ]
              },
              else: 'Unassigned'
            }
          }
        }
      }
    ]);
  
    console.log('Aggregation result:', result);
  
    return result;
  }
  
  
  

  

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, assignedTo: userId }).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }



  async toggleComplete(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, assignedTo: userId });
    if (!task) {
      throw new NotFoundException('Task not found or not authorized');
    }
  
    const wasCompleted = task.completed;
    task.completed = !task.completed;
    await task.save();
  
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    if (!user.tasks) {
      user.tasks = {
        allTasks: 0,
        completedTasks: 0,
        incompleteTasks: 0,
      };
    }
  
    if (task.completed) {
      user.tasks.completedTasks += wasCompleted ? 0 : 1;
      user.tasks.incompleteTasks -= wasCompleted ? 0 : 1;
    } else {
      user.tasks.completedTasks -= wasCompleted ? 1 : 0;
      user.tasks.incompleteTasks += wasCompleted ? 1 : 0;
    }
  
    await this.userModel.findByIdAndUpdate(userId, { tasks: user.tasks }, { new: true });
  
    return task;
  }
  






  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const oldTask = await this.taskModel.findOne({ _id: id, createdBy: userId }).exec();
    if (!oldTask) throw new NotFoundException('Task not found or unauthorized');
  
    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      updateTaskDto,
      { new: true }
    ).exec();
  
    if (!updatedTask) throw new NotFoundException('Task not found after update');
  
    if (
      updateTaskDto.completed !== undefined &&
      updateTaskDto.completed !== oldTask.completed
    ) {
      const assignedUser = await this.userModel.findById(oldTask.assignedTo);
      if (!assignedUser) throw new NotFoundException('Assigned user not found');
  
      await this.userModel.findByIdAndUpdate(
        assignedUser._id,
        {
          $inc: {
            'tasks.completedTasks': updateTaskDto.completed ? 1 : -1,
            'tasks.incompleteTasks': updateTaskDto.completed ? -1 : 1,
          },
        }
      );
    }
  
    return updatedTask;
  }
  



  async remove(id: string, userId: string): Promise<Task> {
    const taskToDelete = await this.taskModel.findOne({ _id: id, createdBy: userId }).exec();
    if (!taskToDelete) {
      throw new NotFoundException('Task not found or unauthorized');
    }
  
    await this.taskModel.findOneAndDelete({ _id: id, createdBy: userId }).exec();
  
    const assignedUser = await this.userModel.findById(taskToDelete.assignedTo);
    if (assignedUser) {
      await this.userModel.findByIdAndUpdate(
        assignedUser._id,
        {
          $inc: {
            'tasks.allTasks': -1,
            'tasks.completedTasks': taskToDelete.completed ? -1 : 0,
            'tasks.incompleteTasks': !taskToDelete.completed ? -1 : 0,
          },
        }
      );
    }
  
    return taskToDelete;
  }
  

}
