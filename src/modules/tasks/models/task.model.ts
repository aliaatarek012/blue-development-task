import { Schema, model, type InferSchemaType } from 'mongoose';
import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TITLE_MAX_LENGTH,
  TaskPriority,
  TaskStatus,
} from '../entities/task.entity';

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: TASK_TITLE_MAX_LENGTH,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: TASK_DESCRIPTION_MAX_LENGTH,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: DEFAULT_TASK_STATUS,
      required: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: DEFAULT_TASK_PRIORITY,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

taskSchema.index({ createdAt: -1 });

export type TaskDocumentShape = InferSchemaType<typeof taskSchema> & {
  status: TaskStatus;
  priority: TaskPriority;
};

export const TaskModel = model('Task', taskSchema);

export type TaskModelType = typeof TaskModel;
