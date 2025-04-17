import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
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
      if (!creator) {
        throw new NotFoundException('Creator not found');
      }
    
      const creatorObjId = new Types.ObjectId(creatorId);
      const assignedToId = new Types.ObjectId(createTaskDto.assignedTo || creatorId);
    
      // 🧠 نحصل على الفريق الخاص بالـ team-lead
      const team = await this.teamModel.findOne({ teamLeader: creatorObjId });
      if (!team) {
        throw new NotFoundException(`No team found for the team leader: ${creatorId}`);
      }
    
      // ✅ إنشاء المهمة وربطها بالفريق
      const newTask = new this.taskModel({
        ...createTaskDto,
        createdBy: creatorObjId,
        assignedTo: assignedToId,
        completed: false,
        teamId: team._id, // ✅ إضافة teamId هنا
      });
    
      // 💾 حفظ المهمة في الداتابيز
      const savedTask = await newTask.save();
    
      // 🔄 تحديث عداد المهام في المستخدم المُكلف
      await this.userModel.findByIdAndUpdate(assignedToId, {
        $inc: {
          'tasks.allTasks': 1,
          'tasks.completedTasks': 0,
          'tasks.incompleteTasks': 1,
        },
      });
    
      // ➕ ربط المهمة بالفريق
      await this.teamModel.findByIdAndUpdate(team._id, {
        $addToSet: { tasks: savedTask._id },
      });
    
      return savedTask;
    }
    
    
    
  

    async findAll(userId: string, category?: string): Promise<Task[]> {
      const matchStage: any = {
        assignedTo: new Types.ObjectId(userId),
      };
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
          $unwind: {
            path: '$assignedUser',
            preserveNullAndEmptyArrays: true
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
              _id: '$assignedUser._id',
              name: '$assignedUser.name',
              email: '$assignedUser.email',
              image: '$assignedUser.image',
            }
          }
        }
      ]);
    
      console.log('Aggregation result:', result);
      return result;
    }
    


    async findAllTasksForTeamLead(teamId: string): Promise<Task[]> {
      const objectId = new mongoose.Types.ObjectId(teamId);
      console.log("Received teamId:", teamId);
    
      const team = await this.teamModel.findById(objectId).lean();
      if (!team || !team.tasks || team.tasks.length === 0) {
        console.log("Team not found or no tasks assigned");
        return [];
      }
    
      console.log("Team task IDs:", team.tasks);
    
      const tasks = await this.taskModel.aggregate([
        {
          $match: {
            _id: { $in: team.tasks },
          },
        },
        // تحويل assignedTo من string إلى ObjectId
        {
          $addFields: {
            assignedTo: { $toObjectId: "$assignedTo" },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'assignedTo',
          },
        },
        {
          $unwind: {
            path: '$assignedTo',
            preserveNullAndEmptyArrays: true, // لا حذف المهام التي لا يوجد لها Assigned
          },
        },
        {
          $match: {
            'assignedTo._id': { $exists: true }, // تأكد من أن assignedTo يحتوي على _id صحيح
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            category: 1,
            dueDate: 1,
            completed: 1,
            'assignedTo.name': 1,
            'assignedTo.email': 1,
            'assignedTo.image': 1,
          },
        },
      ]);
    
      console.log("Aggregation result:", tasks);
    
      return tasks;
    }
    
    



    async findOne(id: string, userId: string): Promise<Task> {
      const task = await this.taskModel.findById(id).exec();
      if (!task) {
        throw new NotFoundException('Task not found');
      }
    
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
    
      if (task.assignedTo?.toString() === userId) {
        return task;
      }
    
      if (
        user.role === 'team-lead' &&
        task.teamId?.toString() === user.team?.toString()
      ) {
        return task;
      }
    
      throw new UnauthorizedException('You are not authorized to access this task');
    }
    

    async toggleComplete(id: string, userId: string): Promise<Task> {
      console.log('🔄 Toggling completion for task:', id);
      console.log('👤 Requested by user ID:', userId);
    
      const task = await this.taskModel.findById(id).exec();
      if (!task) {
        throw new NotFoundException('Task not found');
      }
    
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
    
      const isOwner = task.assignedTo?.toString() === userId;
      const isTeamLead = user.role === 'team-lead' && task.teamId?.toString() === user.team?.toString();
    
      if (!isOwner && !isTeamLead) {
        throw new UnauthorizedException('You are not authorized to toggle this task');
      }
    
      const wasCompleted = task.completed;
      task.completed = !task.completed;
      await task.save();
    
      // ✅ تحديث عدادات اليوزر اللي متسند له التاسك فعلياً
      if (task.assignedTo) {
        const assignedUserId = task.assignedTo.toString();
    
        await this.userModel.findByIdAndUpdate(
          assignedUserId,
          {
            $inc: {
              'tasks.completedTasks': task.completed ? 1 : -1,
              'tasks.incompleteTasks': task.completed ? -1 : 1,
            },
          },
          { new: true }
        );
      }
    
      return task;
    }
    
  
  
  
  
  


  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
  
    const taskId = new Types.ObjectId(id);  
    const userObjectId = new Types.ObjectId(userId);  
  
  
    const oldTask = await this.taskModel.findOne({ _id: taskId, createdBy: userObjectId }).exec();
    if (!oldTask) {
      throw new NotFoundException('Task not found or unauthorized');
    }
  
    const oldTeam = await this.teamModel.findById(oldTask.teamId).exec();
  
    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: taskId, createdBy: userObjectId },
      updateTaskDto,
      { new: true }
    ).exec();
  
    if (!updatedTask) {
      throw new NotFoundException('Task not found after update');
    }
  
    if (updateTaskDto.assignedTo && updateTaskDto.assignedTo !== oldTask.assignedTo?.toString()) {
  
      if (oldTask.assignedTo) {
        const oldAssignedUser = await this.userModel.findById(oldTask.assignedTo).exec();
        if (oldAssignedUser && oldAssignedUser.tasks) {
          if (oldAssignedUser.tasks.allTasks > 0) {
            oldAssignedUser.tasks.allTasks -= 1; 
          }
          if (oldAssignedUser.tasks.completedTasks > 0 && oldTask.completed) {
            oldAssignedUser.tasks.completedTasks -= 1; 
          }
          if (oldAssignedUser.tasks.incompleteTasks > 0 && !oldTask.completed) {
            oldAssignedUser.tasks.incompleteTasks -= 1; 
          }
          await oldAssignedUser.save();
        } else {
        }
      }
  
      const newAssignedUser = await this.userModel.findById(updateTaskDto.assignedTo).exec();
      if (newAssignedUser && newAssignedUser.tasks) {
        newAssignedUser.tasks.allTasks += 1;
        if (updateTaskDto.completed) {
          newAssignedUser.tasks.completedTasks += 1; 
        } else {
          newAssignedUser.tasks.incompleteTasks += 1; 
        }
        await newAssignedUser.save();
      } else {
      }
    } else {
    }
  
    if (updateTaskDto.teamId && updateTaskDto.teamId !== oldTask.teamId.toString()) {
  
      if (oldTeam && oldTeam.tasks) {
        const taskIndex = oldTeam.tasks.indexOf(oldTask._id);
        if (taskIndex !== -1) {
          oldTeam.tasks.splice(taskIndex, 1);
          await oldTeam.save();
        } else {
        }
      }
  
      const newTeam = await this.teamModel.findById(updateTaskDto.teamId).exec();
      if (newTeam) {
        newTeam.tasks.push(updatedTask._id); 
        await newTeam.save();
      } else {
      }
    } else {
    }
  
    if (
      updateTaskDto.completed !== undefined &&
      updateTaskDto.completed !== oldTask.completed
    ) {
  
      const assignedUser = await this.userModel.findById(oldTask.assignedTo);
      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found');
      }
  
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
    console.log('🗑️ Deleting Task with ID:', id);
    console.log('👤 Requested by User ID:', userId);
  
    const taskToDelete = await this.taskModel.findOne({ _id: id }).lean().exec();
  
    if (!taskToDelete) {
      throw new NotFoundException('Task not found');
    }
  
    const user = await this.userModel.findById(userId).exec();
  
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
  

  
    if (user.role === 'team-lead' && taskToDelete.teamId?.toString() === user.team?.toString()) {
      const team = await this.teamModel.findById(taskToDelete.teamId).exec();
      if (team) {
        const taskObjectId = new Types.ObjectId(id);
        
        const taskIndex = team.tasks.indexOf(taskObjectId);
        if (taskIndex !== -1) {
          team.tasks.splice(taskIndex, 1); 
          await team.save();
        }
      }
  
      await this.taskModel.deleteOne({ _id: id }).exec();
  
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
  
      return taskToDelete as Task;
    }
  
    throw new UnauthorizedException('You do not have permission to delete this task');
  }
  
  
}
