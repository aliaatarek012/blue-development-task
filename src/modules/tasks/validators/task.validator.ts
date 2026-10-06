import { z } from 'zod';
import type { CreateTaskDto } from '../dto/create-task.dto';
import type { UpdateTaskDto } from '../dto/update-task.dto';
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  TaskPriority,
  TaskStatus,
} from '../entities/task.entity';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const titleSchema = z
  .string({ required_error: 'Title is required', invalid_type_error: 'Title must be a string' })
  .trim()
  .min(1, 'Title cannot be empty')
  .max(TASK_TITLE_MAX_LENGTH, `Title must be at most ${TASK_TITLE_MAX_LENGTH} characters`);

const descriptionSchema = z
  .string({ invalid_type_error: 'Description must be a string' })
  .trim()
  .max(TASK_DESCRIPTION_MAX_LENGTH, `Description must be at most ${TASK_DESCRIPTION_MAX_LENGTH} characters`);

const statusSchema = z.nativeEnum(TaskStatus, {
  errorMap: () => ({ message: `Status must be one of: ${Object.values(TaskStatus).join(', ')}` }),
});

const prioritySchema = z.nativeEnum(TaskPriority, {
  errorMap: () => ({ message: `Priority must be one of: ${Object.values(TaskPriority).join(', ')}` }),
});

const taskFields = {
  title: titleSchema,
  description: descriptionSchema.optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
};

export const createTaskBodySchema: z.ZodType<CreateTaskDto, z.ZodTypeDef, unknown> = z
  .object(taskFields, { invalid_type_error: 'Request body must be a JSON object' })
  .strict();

export const updateTaskBodySchema: z.ZodType<UpdateTaskDto, z.ZodTypeDef, unknown> = z
  .object({ ...taskFields, title: titleSchema.optional() }, { invalid_type_error: 'Request body must be a JSON object' })
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'At least one field must be provided for update' });

export const taskIdParamsSchema = z.object({
  id: z.string().regex(OBJECT_ID_PATTERN, 'Task id must be a valid 24-character hex ObjectId'),
});
