import type { Router } from 'express';
import { TaskController } from './controllers/task.controller';
import { TaskModel } from './models/task.model';
import { MongoTaskRepository } from './repositories/task.repository';
import type { ITaskRepository } from './repositories/task.repository.interface';
import { createTaskRouter } from './routes/task.routes';
import { TaskService } from './services/task.service';

export interface TaskModule {
  basePath: string;
  router: Router;
}

/**
 * Composition root for the tasks module. A different ITaskRepository
 * (e.g. an in-memory one for tests) can be injected without touching the service.
 */
export function createTaskModule(repository: ITaskRepository = new MongoTaskRepository(TaskModel)): TaskModule {
  const service = new TaskService(repository);
  const controller = new TaskController(service);

  return {
    basePath: '/tasks',
    router: createTaskRouter(controller),
  };
}
