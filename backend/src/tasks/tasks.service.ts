import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { User } from '../auth/schemas/user.schema';


@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) { }

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const newTask = new this.taskModel({
      title: createTaskDto.title,
      description: createTaskDto.description,
      category: createTaskDto.category,
      dueDate: createTaskDto.dueDate,
      userId,
      completed: false,  
    });
  
    const savedTask = await newTask.save();
  
    const isCompleted = savedTask.completed;  
  
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          'tasks.allTasks': 1,
          'tasks.completedTasks': isCompleted ? 1 : 0,
          'tasks.incompleteTasks': isCompleted ? 0 : 1,
        },
      }
    );
  
    return savedTask;
  }

  async findAll(userId: string, category?: string): Promise<Task[]> {
    const filter: any = { userId };
    if (category) {
      filter.category = category;
    }
    return this.taskModel.find(filter).exec();
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }


  async toggleComplete(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, userId });
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
    const oldTask = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!oldTask) throw new NotFoundException('Task not found');
  
    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: id, userId },
      updateTaskDto,
      { new: true }
    ).exec();
  
    if (!updatedTask) throw new NotFoundException('Task not found after update');
  
    if (
      updateTaskDto.completed !== undefined &&
      updateTaskDto.completed !== oldTask.completed
    ) {
      await this.userModel.findByIdAndUpdate(
        userId,
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
    const taskToDelete = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!taskToDelete) {
      throw new NotFoundException('Task not found or unauthorized');
    }
  
    await this.taskModel.findOneAndDelete({ _id: id, userId }).exec();
  
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          'tasks.allTasks': -1, 
          'tasks.completedTasks': taskToDelete.completed ? -1 : 0, 
          'tasks.incompleteTasks': !taskToDelete.completed ? -1 : 0, 
        },
      }
    );
  
    return taskToDelete;
  }
  
}
