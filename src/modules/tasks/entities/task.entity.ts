export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export const TASK_STATUSES = Object.values(TaskStatus);
export const TASK_PRIORITIES = Object.values(TaskPriority);

export const DEFAULT_TASK_STATUS = TaskStatus.PENDING;
export const DEFAULT_TASK_PRIORITY = TaskPriority.MEDIUM;

export const TASK_TITLE_MAX_LENGTH = 120;
export const TASK_DESCRIPTION_MAX_LENGTH = 2000;

/** Persistence-agnostic representation of a task, shared by every layer above the repository. */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}
