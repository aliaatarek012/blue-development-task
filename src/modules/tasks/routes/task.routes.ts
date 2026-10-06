import { Router } from 'express';
import { validateRequest } from '../../../middleware/validation.middleware';
import type { TaskController } from '../controllers/task.controller';
import { createTaskBodySchema, taskIdParamsSchema, updateTaskBodySchema } from '../validators/task.validator';

export function createTaskRouter(controller: TaskController): Router {
  const router = Router();

  router.post('/', validateRequest({ body: createTaskBodySchema }), controller.createTask);
  router.get('/', controller.getTasks);
  router.get('/:id', validateRequest({ params: taskIdParamsSchema }), controller.getTaskById);
  router.patch(
    '/:id',
    validateRequest({ params: taskIdParamsSchema, body: updateTaskBodySchema }),
    controller.updateTask,
  );
  router.delete('/:id', validateRequest({ params: taskIdParamsSchema }), controller.deleteTask);

  return router;
}
