import type { CreateTaskDto } from './create-task.dto';

/** Validated partial input for updating a task. At least one field is guaranteed by validation. */
export type UpdateTaskDto = Partial<CreateTaskDto>;
