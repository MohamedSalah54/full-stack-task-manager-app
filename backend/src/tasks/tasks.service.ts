import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private readonly taskModel: Model<Task>) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const newTask = new this.taskModel({ ...createTaskDto, userId });
    return newTask.save();
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

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: id, userId },
      updateTaskDto,
      { new: true }
    ).exec();
    if (!updatedTask) {
      throw new NotFoundException('Task not found or unauthorized');
    }
    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<Task> {
    const deletedTask = await this.taskModel.findOneAndDelete({ _id: id, userId }).exec();
    if (!deletedTask) {
      throw new NotFoundException('Task not found or unauthorized');
    }
    return deletedTask;
  }
}
