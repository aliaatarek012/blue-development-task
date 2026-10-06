import { ErrorCode, NotFoundError } from '../../../common/errors';
import type { CreateTaskDto } from '../dto/create-task.dto';
import type { UpdateTaskDto } from '../dto/update-task.dto';
import { DEFAULT_TASK_PRIORITY, DEFAULT_TASK_STATUS, type Task } from '../entities/task.entity';
import type { ITaskRepository } from '../repositories/task.repository.interface';

export class TaskService {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async createTask(dto: CreateTaskDto): Promise<Task> {
    return this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? DEFAULT_TASK_STATUS,
      priority: dto.priority ?? DEFAULT_TASK_PRIORITY,
    });
  }

  async getTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    return this.ensureFound(task, id);
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.update(id, dto);
    return this.ensureFound(task, id);
  }

  async deleteTask(id: string): Promise<void> {
    const deleted = await this.taskRepository.delete(id);
    if (!deleted) throw this.taskNotFound(id);
  }

  private ensureFound(task: Task | null, id: string): Task {
    if (!task) throw this.taskNotFound(id);
    return task;
  }

  private taskNotFound(id: string): NotFoundError {
    return new NotFoundError(`Task with id '${id}' not found`, ErrorCode.TASK_NOT_FOUND);
  }
}
