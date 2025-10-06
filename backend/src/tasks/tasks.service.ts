import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Task } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { User } from '../auth/schemas/user.schema';
import { Team } from 'src/teams/schema/team.schema';
import { NotificationsService } from 'src/notifications/notifications.service';



@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    private readonly notificationsService: NotificationsService,

  ) { }


  async createTaskForSelf(createTaskDto: CreateTaskDto, creatorId: string): Promise<Task> {
    const creator = await this.userModel.findById(creatorId);
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const creatorObjId = new Types.ObjectId(creatorId);
    const assignedToId = new Types.ObjectId(createTaskDto.assignedTo || creatorId);

    if (creator.role !== 'team-lead' && creator.role !== 'admin') {
      throw new UnauthorizedException('Only team leads and admins can create tasks for themselves');
    }

    const newTask = new this.taskModel({
      ...createTaskDto,
      createdBy: creatorObjId,
      assignedTo: assignedToId,
      completed: false,
      teamId: null,
    });

    const savedTask = await newTask.save();

    await this.userModel.findByIdAndUpdate(assignedToId, {
      $inc: {
        'tasks.allTasks': 1,
        'tasks.completedTasks': 0,
        'tasks.incompleteTasks': 1,
      },
    });

    if (creator.role === 'team-lead' && assignedToId.toString() !== creatorId) {
      const assignedToUser = await this.userModel.findById(assignedToId);
      if (!assignedToUser) {
        throw new NotFoundException('Assigned user not found');
      }

      const notificationMessage = `${assignedToUser.name} has been assigned a new task: ${savedTask.title} from ${creator.name}`;

      const notification = await this.notificationsService.create({
        userId: assignedToId.toString(),
        message: notificationMessage,
      });

      await this.userModel.findByIdAndUpdate(assignedToId, {
        $push: {
          notifications: {
            _id: notification._id,
            message: notification.message,
            createdAt: notification.createdAt,
            read: false,
          },
        },
      });
    }

    return savedTask;
  }


  async create(createTaskDto: CreateTaskDto, creatorId: string): Promise<Task> {
    const creator = await this.userModel.findById(creatorId);
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const creatorObjId = new Types.ObjectId(creatorId);
    const assignedToId = new Types.ObjectId(createTaskDto.assignedTo || creatorId);

    const team = await this.teamModel.findOne({ teamLeader: creatorObjId });
    if (!team) {
      throw new NotFoundException(`No team found for the team leader: ${creatorId}`);
    }

    const newTask = new this.taskModel({
      ...createTaskDto,
      createdBy: creatorObjId,
      assignedTo: assignedToId,
      completed: false,
      teamId: team._id,
    });

    const savedTask = await newTask.save();

    await this.userModel.findByIdAndUpdate(assignedToId, {
      $inc: {
        'tasks.allTasks': 1,
        'tasks.completedTasks': 0,
        'tasks.incompleteTasks': 1,
      },
    });

    await this.teamModel.findByIdAndUpdate(team._id, {
      $addToSet: { tasks: savedTask._id },
    });

    if (creator.role === 'team-lead' && assignedToId.toString() !== creatorId) {
      const assignedToUser = await this.userModel.findById(assignedToId);
      if (!assignedToUser) {
        throw new NotFoundException('Assigned user not found');
      }

      const notificationMessage = `${assignedToUser.name} has been assigned a new task: ${savedTask.title} from ${creator.name}`;

      const notification = await this.notificationsService.create({
        userId: assignedToId.toString(),
        message: notificationMessage,
      });

      await this.userModel.findByIdAndUpdate(assignedToId, {
        $push: {
          notifications: {
            _id: notification._id,
            message: notification.message,
            createdAt: notification.createdAt,
            read: false,
          },
        },
      });
    }

    return savedTask;
  }




  async getTasksWithTeamNameAndStatus(): Promise<any[]> {
    const result = await this.taskModel.aggregate([
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'teamInfo',
        },
      },
      {
        $unwind: {
          path: '$teamInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          teamId: { $ne: null },
        },
      },
      {
        $group: {
          _id: { $toString: '$teamId' },
          teamName: { $first: '$teamInfo.name' },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] },
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] },
          },
        },
      },
      {
        $sort: { completedTasks: -1 },
      },
    ]);

    console.log("Backend result:", result);
    return result;
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
          commentsCount: 1,
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'assignedTo._id': { $exists: true },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          dueDate: 1,
          completed: 1,
          commentsCount: 1,
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

    const isOwner = (task.assignedTo as Types.ObjectId)?.toString() === userId;
    const isTeamLead = user.role === 'team-lead' && task.teamId?.toString() === user.team?.toString();

    if (!isOwner && !isTeamLead) {
      throw new UnauthorizedException('You are not authorized to toggle this task');
    }

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    await task.save();

    if (task.assignedTo) {
      const assignedUserId = (task.assignedTo as Types.ObjectId).toString();

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

    if (wasCompleted === false && task.completed === true) {
      const creator = await this.userModel.findById(task.createdBy).exec();
      if (creator) {
        const message = `Task "${task.title}" has been marked as complete by ${user.name}`;

        await this.notificationsService.create({
          userId: (creator._id as Types.ObjectId).toString(),
          message,
        });

        creator.notifications.push({
          message,
          isRead: false,
          date: new Date(),
          createdAt: new Date(),
        });

        await creator.save();
      }

      if (!creator && task.teamId) {
        const teamLead = await this.userModel.findOne({ role: 'team-lead', team: task.teamId }).exec();
        if (teamLead) {
          const message = `Task "${task.title}" has been marked as complete by ${user.name}`;

          await this.notificationsService.create({
            userId: (teamLead._id as Types.ObjectId).toString(),
            message,
          });

          teamLead.notifications.push({
            message,
            isRead: false,
            date: new Date(),
            createdAt: new Date(),
          });

          await teamLead.save();
        }
      }
    }

    const populatedTask = await this.taskModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
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
          preserveNullAndEmptyArrays: true,
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

    if (populatedTask.length === 0) {
      throw new NotFoundException('Task not found');
    }

    return populatedTask[0];
  }




  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const taskId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);

    const oldTask = await this.taskModel.findOne({ _id: taskId, createdBy: userObjectId }).exec();
    if (!oldTask) {
      throw new NotFoundException('Task not found or unauthorized');
    }

    const oldTeam = await this.teamModel.findById(oldTask.teamId).exec();

 if (updateTaskDto.assignedTo) {
  updateTaskDto.assignedTo = new Types.ObjectId(updateTaskDto.assignedTo);
}


    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: taskId, createdBy: userObjectId },
      updateTaskDto,
      { new: true }
    ).exec();

    if (!updatedTask) {
      throw new NotFoundException('Task not found after update');
    }


 if (
  updateTaskDto.assignedTo &&
  oldTask.assignedTo &&
  updateTaskDto.assignedTo.toString() !== oldTask.assignedTo.toString()
)
 {
      if (oldTask.assignedTo) {
        const oldAssignedUser = await this.userModel.findById(oldTask.assignedTo).exec();
        if (oldAssignedUser && oldAssignedUser.tasks) {
          if (oldAssignedUser.tasks.allTasks > 0) oldAssignedUser.tasks.allTasks -= 1;
          if (oldAssignedUser.tasks.completedTasks > 0 && oldTask.completed) oldAssignedUser.tasks.completedTasks -= 1;
          if (oldAssignedUser.tasks.incompleteTasks > 0 && !oldTask.completed) oldAssignedUser.tasks.incompleteTasks -= 1;
          await oldAssignedUser.save();
        }
      }

      const newAssignedUser = await this.userModel.findById(updateTaskDto.assignedTo).exec();
      if (newAssignedUser && newAssignedUser.tasks) {
        newAssignedUser.tasks.allTasks += 1;
        if (updateTaskDto.completed) newAssignedUser.tasks.completedTasks += 1;
        else newAssignedUser.tasks.incompleteTasks += 1;

        const taskTitle = updatedTask.title;
        const creator = await this.userModel.findById(userId).exec();
        const message = `You have been assigned to a new task "${taskTitle}" by ${creator?.name || 'Team Lead'}`;
        const notification = await this.notificationsService.create({
          userId: (newAssignedUser._id as Types.ObjectId).toString(),
          message,
        });

        newAssignedUser.notifications.push({
          _id: notification._id,
          message,
          isRead: false,
          date: notification.date,
          createdAt: notification.createdAt,
        });

        await newAssignedUser.save();
      }
    }


    if (updateTaskDto.teamId && updateTaskDto.teamId !== oldTask.teamId.toString()) {
      if (oldTeam && oldTeam.tasks) {
        const taskIndex = oldTeam.tasks.indexOf(oldTask._id);
        if (taskIndex !== -1) {
          oldTeam.tasks.splice(taskIndex, 1);
          await oldTeam.save();
        }
      }

      const newTeam = await this.teamModel.findById(updateTaskDto.teamId).exec();
      if (newTeam) {
        newTeam.tasks.push(updatedTask._id);
        await newTeam.save();
      }
    }

    if (updateTaskDto.completed !== undefined && updateTaskDto.completed !== oldTask.completed) {
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

    if (user.role === 'admin') {
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

    if (user.role === 'team-lead') {
      if (taskToDelete.createdBy.toString() === userId || (taskToDelete.assignedTo as Types.ObjectId).toString() === userId) {
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
      } else {
        throw new UnauthorizedException('You do not have permission to delete this task');
      }
    }

    throw new UnauthorizedException('You do not have permission to delete this task');
  }


  async findAllForAdmin() {
    return this.taskModel.aggregate([
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      {
        $unwind: {
          path: '$createdBy',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'teamId',
        },
      },
      {
        $unwind: {
          path: '$teamId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          dueDate: 1,
          completed: 1,
          createdAt: 1,
          assignedTo: { name: 1, email: 1 },
          createdBy: { name: 1, email: 1 },
          teamId: { name: 1 },
        },
      },
    ]);
  }



}
