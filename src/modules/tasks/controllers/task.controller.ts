import type { Request, Response } from 'express';
import { sendNoContent, sendSuccess } from '../../../common/responses/api-response';
import { HttpStatus } from '../../../common/types/http-status';
import type { CreateTaskDto } from '../dto/create-task.dto';
import type { UpdateTaskDto } from '../dto/update-task.dto';
import type { TaskService } from '../services/task.service';

type TaskIdParams = { id: string };

/**
 * HTTP adapter for the task use cases. Input is already validated by middleware,
 * and thrown errors are forwarded by Express 5 to the global error handler.
 */
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  createTask = async (req: Request<object, unknown, CreateTaskDto>, res: Response): Promise<void> => {
    const task = await this.taskService.createTask(req.body);
    sendSuccess(res, task, HttpStatus.CREATED);
  };

  getTasks = async (_req: Request, res: Response): Promise<void> => {
    const tasks = await this.taskService.getTasks();
    sendSuccess(res, tasks);
  };

  getTaskById = async (req: Request<TaskIdParams>, res: Response): Promise<void> => {
    const task = await this.taskService.getTaskById(req.params.id);
    sendSuccess(res, task);
  };

  updateTask = async (req: Request<TaskIdParams, unknown, UpdateTaskDto>, res: Response): Promise<void> => {
    const task = await this.taskService.updateTask(req.params.id, req.body);
    sendSuccess(res, task);
  };

  deleteTask = async (req: Request<TaskIdParams>, res: Response): Promise<void> => {
    await this.taskService.deleteTask(req.params.id);
    sendNoContent(res);
  };
}
