import type { CreateTaskDto } from '../dto/create-task.dto';
import type { UpdateTaskDto } from '../dto/update-task.dto';
import type { Task } from '../entities/task.entity';

export type NewTaskData = Required<Pick<CreateTaskDto, 'title' | 'description' | 'status' | 'priority'>>;

/**
 * Persistence contract for tasks. Implementations must:
 * - return `null` from findById/update when the task does not exist (including malformed ids),
 * - return `false` from delete when nothing was deleted,
 * - never leak storage-specific types (documents, ObjectIds) to callers.
 */
export interface ITaskRepository {
  create(data: NewTaskData): Promise<Task>;
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(id: string, data: UpdateTaskDto): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
