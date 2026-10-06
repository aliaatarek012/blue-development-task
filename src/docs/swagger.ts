import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TITLE_MAX_LENGTH,
} from '../modules/tasks/entities/task.entity';

const errorResponse = (description: string, example: object) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example,
    },
  },
});

const responses = {
  ValidationError: errorResponse('Invalid request (validation failed or malformed JSON)', {
    success: false,
    error: {
      message: 'Request validation failed',
      code: 'VALIDATION_ERROR',
      details: [{ field: 'title', message: 'Title is required' }],
    },
  }),
  TaskNotFound: errorResponse('Task not found', {
    success: false,
    error: { message: "Task with id '665f1c2b9a1e4c3d2f0a1b2c' not found", code: 'TASK_NOT_FOUND' },
  }),
  InternalServerError: errorResponse('Unexpected server or database error', {
    success: false,
    error: { message: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR' },
  }),
};

const taskExample = {
  id: '665f1c2b9a1e4c3d2f0a1b2c',
  title: 'Write project README',
  description: 'Document setup, environment variables and example requests',
  status: 'in_progress',
  priority: 'high',
  createdAt: '2026-10-06T11:52:00.000Z',
  updatedAt: '2026-10-06T12:10:00.000Z',
};

const taskSuccessResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Task' },
        },
      },
      example: { success: true, data: taskExample },
    },
  },
});

export function buildSwaggerSpec(serverUrl: string) {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description:
        'REST API for managing tasks. All responses use a consistent envelope: ' +
        '`{ success: true, data }` on success and `{ success: false, error: { message, code, details? } }` on failure.',
    },
    servers: [{ url: serverUrl }],
    tags: [{ name: 'Tasks', description: 'Task CRUD operations' }],
    paths: {
      '/tasks': {
        post: {
          tags: ['Tasks'],
          summary: 'Create a task',
          operationId: 'createTask',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTaskRequest' },
                example: { title: 'Write project README', description: 'Document the API', priority: 'high' },
              },
            },
          },
          responses: {
            201: taskSuccessResponse('Task created'),
            400: { $ref: '#/components/responses/ValidationError' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        get: {
          tags: ['Tasks'],
          summary: 'List all tasks (newest first)',
          operationId: 'getTasks',
          responses: {
            200: {
              description: 'List of tasks',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['success', 'data'],
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    },
                  },
                  example: { success: true, data: [taskExample] },
                },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/tasks/{id}': {
        parameters: [{ $ref: '#/components/parameters/TaskId' }],
        get: {
          tags: ['Tasks'],
          summary: 'Get a task by id',
          operationId: 'getTaskById',
          responses: {
            200: taskSuccessResponse('The requested task'),
            400: { $ref: '#/components/responses/ValidationError' },
            404: { $ref: '#/components/responses/TaskNotFound' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        patch: {
          tags: ['Tasks'],
          summary: 'Partially update a task',
          description: 'All fields are optional, but at least one must be provided. Unknown fields are rejected.',
          operationId: 'updateTask',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
                example: { status: 'completed' },
              },
            },
          },
          responses: {
            200: taskSuccessResponse('Updated task'),
            400: { $ref: '#/components/responses/ValidationError' },
            404: { $ref: '#/components/responses/TaskNotFound' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete a task',
          operationId: 'deleteTask',
          responses: {
            204: { description: 'Task deleted (no response body)' },
            400: { $ref: '#/components/responses/ValidationError' },
            404: { $ref: '#/components/responses/TaskNotFound' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
    },
    components: {
      parameters: {
        TaskId: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Task id (24-character hex MongoDB ObjectId). Copy a real id from GET /tasks or POST /tasks.',
          schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
        },
      },
      schemas: {
        TaskStatus: { type: 'string', enum: TASK_STATUSES },
        TaskPriority: { type: 'string', enum: TASK_PRIORITIES },
        Task: {
          type: 'object',
          required: ['id', 'title', 'description', 'status', 'priority', 'createdAt', 'updatedAt'],
          properties: {
            id: { type: 'string', example: taskExample.id },
            title: { type: 'string', maxLength: TASK_TITLE_MAX_LENGTH },
            description: { type: 'string', maxLength: TASK_DESCRIPTION_MAX_LENGTH },
            status: { $ref: '#/components/schemas/TaskStatus' },
            priority: { $ref: '#/components/schemas/TaskPriority' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          additionalProperties: false,
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: TASK_TITLE_MAX_LENGTH,
              description: 'Required. Leading/trailing whitespace is trimmed; must not be empty.',
            },
            description: {
              type: 'string',
              maxLength: TASK_DESCRIPTION_MAX_LENGTH,
              description: 'Optional. Defaults to an empty string.',
            },
            status: {
              allOf: [{ $ref: '#/components/schemas/TaskStatus' }],
              description: `Optional. Defaults to \`${DEFAULT_TASK_STATUS}\`.`,
            },
            priority: {
              allOf: [{ $ref: '#/components/schemas/TaskPriority' }],
              description: `Optional. Defaults to \`${DEFAULT_TASK_PRIORITY}\`.`,
            },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          minProperties: 1,
          additionalProperties: false,
          properties: {
            title: { type: 'string', minLength: 1, maxLength: TASK_TITLE_MAX_LENGTH },
            description: { type: 'string', maxLength: TASK_DESCRIPTION_MAX_LENGTH },
            status: { $ref: '#/components/schemas/TaskStatus' },
            priority: { $ref: '#/components/schemas/TaskPriority' },
          },
        },
        FieldError: {
          type: 'object',
          required: ['field', 'message'],
          properties: {
            field: { type: 'string', example: 'title' },
            message: { type: 'string', example: 'Title is required' },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              required: ['message', 'code'],
              properties: {
                message: { type: 'string' },
                code: {
                  type: 'string',
                  enum: [
                    'BAD_REQUEST',
                    'VALIDATION_ERROR',
                    'INVALID_JSON',
                    'TASK_NOT_FOUND',
                    'ROUTE_NOT_FOUND',
                    'INTERNAL_SERVER_ERROR',
                  ],
                },
                details: { type: 'array', items: { $ref: '#/components/schemas/FieldError' } },
              },
            },
          },
        },
      },
      responses,
    },
  };
}
