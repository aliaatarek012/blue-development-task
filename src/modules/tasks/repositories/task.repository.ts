import { isValidObjectId, type Types } from 'mongoose';
import type { UpdateTaskDto } from '../dto/update-task.dto';
import type { Task } from '../entities/task.entity';
import type { TaskDocumentShape, TaskModelType } from '../models/task.model';
import type { ITaskRepository, NewTaskData } from './task.repository.interface';

type PersistedTask = TaskDocumentShape & { _id: Types.ObjectId };

export class MongoTaskRepository implements ITaskRepository {
  constructor(private readonly taskModel: TaskModelType) {}

  async create(data: NewTaskData): Promise<Task> {
    const document = await this.taskModel.create(data);
    return this.toEntity(document.toObject<PersistedTask>());
  }

  async findAll(): Promise<Task[]> {
    const documents = await this.taskModel.find().sort({ createdAt: -1 }).lean<PersistedTask[]>().exec();
    return documents.map((document) => this.toEntity(document));
  }

  async findById(id: string): Promise<Task | null> {
    if (!isValidObjectId(id)) return null;

    const document = await this.taskModel.findById(id).lean<PersistedTask>().exec();
    return document ? this.toEntity(document) : null;
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task | null> {
    if (!isValidObjectId(id)) return null;

    const document = await this.taskModel
      .findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true })
      .lean<PersistedTask>()
      .exec();
    return document ? this.toEntity(document) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;

    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  private toEntity(document: PersistedTask): Task {
    return {
      id: document._id.toString(),
      title: document.title,
      description: document.description ?? '',
      status: document.status,
      priority: document.priority,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
