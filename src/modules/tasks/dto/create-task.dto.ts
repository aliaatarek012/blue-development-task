import type { TaskPriority, TaskStatus } from '../entities/task.entity';

/** Validated input for creating a task, as received from the client. */
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
