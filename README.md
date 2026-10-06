# Task Management API

A Task Management REST API built with **Node.js, Express 5, TypeScript, MongoDB/Mongoose, Zod and Swagger (OpenAPI 3)**, structured around clean architecture, SOLID principles and strict separation of concerns.

---

## Features

- Full task CRUD (`POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id`)
- Layered architecture: **Route → Validation → Controller → Service → Repository → Model → MongoDB**
- Repository abstraction (`ITaskRepository`) injected into the service (Dependency Inversion)
- Request validation with Zod (body + path params), unknown fields rejected
- Centralized error handling with typed application errors
- Consistent response envelope for success and error responses
- Correct HTTP status codes (201, 200, 204, 400, 404, 500)
- Swagger UI at `/api/docs`, generated from the same constants the code uses
- Validated, centralized environment configuration
- Graceful shutdown, `helmet`, `cors`, JSON body size limit

---

## Request lifecycle

```text
User (actor)
  → HTTP request            POST /api/tasks
  → Route                   task.routes.ts        maps URL + method to a handler chain
  → Validation middleware   validateRequest()     Zod-validates params/body, 400 on failure
  → Controller              TaskController        extracts input, calls service, picks status code
  → Service (use case)      TaskService           business rules (defaults, not-found semantics)
  → Repository              MongoTaskRepository   Mongoose queries, maps documents → Task entity
  → Mongoose model          TaskModel             schema, timestamps, DB-level constraints
  → MongoDB
  ← Task entity bubbles back up
  ← Controller              sendSuccess(res, task, 201)
  ← Error middleware        (only when something throws) → clean JSON error
```

### Use-case analysis

| Use case | Input | Validation | Business logic (service) | Not found | Success |
|---|---|---|---|---|---|
| Create task | body | title required, enums, lengths | apply default status/priority/description | n/a | `201` + task |
| List tasks | none | none | return all, newest first | n/a | `200` + array |
| Get task | `id` | ObjectId format | throw `TaskNotFound` if missing | `404` | `200` + task |
| Update task | `id` + partial body | ObjectId format, ≥1 field, same rules as create | throw `TaskNotFound` if missing | `404` | `200` + task |
| Delete task | `id` | ObjectId format | throw `TaskNotFound` if nothing deleted | `404` | `204` no body |

---

## Project structure

```text
src/
├── app.ts                         # Express app factory (middleware, docs, modules, error handling)
├── server.ts                      # Bootstrap: DB connection, HTTP server, graceful shutdown
├── config/
│   ├── env.ts                     # Single place that reads & validates process.env
│   └── database.ts                # Mongoose connect/disconnect
├── common/
│   ├── errors/                    # AppError, BadRequestError, ValidationError, NotFoundError, ErrorCode
│   ├── responses/api-response.ts  # sendSuccess / sendNoContent / sendError helpers
│   └── types/                     # HttpStatus enum, response envelope types
├── middleware/
│   ├── validation.middleware.ts   # Generic Zod request validator
│   └── error.middleware.ts        # 404 route handler + global error handler
├── docs/
│   └── swagger.ts                 # OpenAPI 3 specification
└── modules/
    └── tasks/
        ├── entities/task.entity.ts               # Task type, TaskStatus/TaskPriority enums, constraints
        ├── dto/                                  # CreateTaskDto, UpdateTaskDto
        ├── validators/task.validator.ts          # Zod schemas for body and params
        ├── models/task.model.ts                  # Mongoose schema + model
        ├── repositories/
        │   ├── task.repository.interface.ts      # ITaskRepository (abstraction)
        │   └── task.repository.ts                # MongoTaskRepository (implementation)
        ├── services/task.service.ts              # Use cases / business logic
        ├── controllers/task.controller.ts        # HTTP adapter
        ├── routes/task.routes.ts                 # Route definitions + validation wiring
        └── task.module.ts                        # Composition root (dependency injection)
```

### Layer responsibilities

| Layer | Owns | Must not |
|---|---|---|
| Route | URL/method mapping, attaching validators | contain logic |
| Validator | Shape/format of client input | know about the DB or business rules |
| Controller | HTTP: read params/body, call service, choose status code | contain business logic, touch Mongoose |
| Service | Business rules, orchestration, domain errors | know about `req`/`res` or Mongoose |
| Repository | Persistence and mapping documents to entities | contain business rules |
| Model | Database schema and DB-level constraints | be used outside the repository |

### How SOLID is applied

- **Single responsibility.** Each class or file has one job: the controller handles HTTP, the service holds the use cases, the repository does persistence, the validator checks input, and the error middleware formats errors.
- **Open/closed.** New feature modules plug into `createApp({ modules })` without editing `app.ts`'s logic. New error types extend `AppError` and are handled automatically by the error middleware. A new storage backend is a new `ITaskRepository` implementation, and the service doesn't change.
- **Liskov substitution.** `ITaskRepository` documents its contract (null for missing tasks, `false` when nothing was deleted, no storage types leaking out), so any implementation, such as an in-memory one for tests, is interchangeable.
- **Interface segregation.** The repository interface contains only task persistence operations. Request schemas are kept separate per use case.
- **Dependency inversion.** `TaskService` depends on `ITaskRepository`, not on Mongoose. The concrete `MongoTaskRepository` is wired in a single place: `task.module.ts`.

---

## Prerequisites

- Node.js **18+** (developed on Node 22)
- npm
- MongoDB 6+ (local install, Docker, or MongoDB Atlas)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env

# 3. Make sure MongoDB is running (see below), then start the API
npm run dev
```

### Environment variables

`.env.example`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task-management
CORS_ORIGIN=*
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | yes | none | MongoDB connection string |
| `PORT` | no | `3000` | HTTP port |
| `NODE_ENV` | no | `development` | `development`, `production` or `test` |
| `CORS_ORIGIN` | no | `*` | Allowed CORS origin |

The env file is validated at startup (`src/config/env.ts`). If it's invalid, the app refuses to start and prints a clear message. No other file reads `process.env`.

---

## MongoDB setup

Pick one option.

**Option A: Docker (easiest)**

```bash
docker compose up -d
# MongoDB is now on mongodb://localhost:27017
```

**Option B: Local install**

1. Install MongoDB Community Server: <https://www.mongodb.com/try/download/community>
2. Start it. On Windows it usually runs as the `MongoDB` service; on macOS run `brew services start mongodb-community`; on Linux run `sudo systemctl start mongod`.
3. Use `MONGODB_URI=mongodb://localhost:27017/task-management`.

**Option C: MongoDB Atlas (cloud)**

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Create a database user and allow your IP address.
3. Copy the connection string into `.env`:
   `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/task-management`

The `tasks` collection is created automatically on first insert.

---

## Running

| Command | Description |
|---|---|
| `npm run dev` | Start in watch mode with `tsx` |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Type-check without emitting |

---

## Swagger / OpenAPI

Once the server is running, open:

**<http://localhost:3000/api/docs>**

Every endpoint is documented there, including request bodies, path parameters, validation rules, response schemas and error responses. Use **"Try it out"** to call the API directly.

A health check is available at `GET /health`.

---

## API reference

Base URL: `http://localhost:3000/api`

| Method | Path | Description | Success |
|---|---|---|---|
| POST | `/tasks` | Create a task | `201` |
| GET | `/tasks` | List tasks (newest first) | `200` |
| GET | `/tasks/:id` | Get one task | `200` |
| PATCH | `/tasks/:id` | Partially update a task | `200` |
| DELETE | `/tasks/:id` | Delete a task | `204` |

**Task fields**

| Field | Type | Rules |
|---|---|---|
| `title` | string | required on create, trimmed, 1–120 characters |
| `description` | string | optional, at most 2000 characters, defaults to `""` |
| `status` | enum | `pending` \| `in_progress` \| `completed`, defaults to `pending` |
| `priority` | enum | `low` \| `medium` \| `high`, defaults to `medium` |

Unknown fields are rejected with `400`. A `PATCH` request must include at least one field.

### Response format

Success:

```json
{ "success": true, "data": { } }
```

Error:

```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND",
    "details": [{ "field": "title", "message": "Title is required" }]
  }
}
```

`details` is only present on validation errors. Error codes: `VALIDATION_ERROR`, `INVALID_JSON`, `BAD_REQUEST`, `TASK_NOT_FOUND`, `ROUTE_NOT_FOUND`, `INTERNAL_SERVER_ERROR`. Stack traces and database errors are never sent to the client; they are logged on the server.

---

## Example requests

### Create a task: `201 Created`

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write README", "description": "Document the API", "priority": "high"}'
```

```json
{
  "success": true,
  "data": {
    "id": "6ac4e2d43591fef1ea3bd9bd",
    "title": "Write README",
    "description": "Document the API",
    "status": "pending",
    "priority": "high",
    "createdAt": "2026-10-06T12:00:20.857Z",
    "updatedAt": "2026-10-06T12:00:20.857Z"
  }
}
```

### Create with invalid input: `400 Bad Request`

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"description": 5, "status": "done"}'
```

```json
{
  "success": false,
  "error": {
    "message": "Request validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "title", "message": "Title is required" },
      { "field": "description", "message": "Description must be a string" },
      { "field": "status", "message": "Status must be one of: pending, in_progress, completed" }
    ]
  }
}
```

### List tasks: `200 OK`

```bash
curl http://localhost:3000/api/tasks
```

```json
{ "success": true, "data": [ { "id": "6ac4e2d43591fef1ea3bd9bd", "title": "Write README", "...": "..." } ] }
```

### Get a task: `200 OK` / `404 Not Found`

```bash
curl http://localhost:3000/api/tasks/6ac4e2d43591fef1ea3bd9bd
```

```json
{
  "success": false,
  "error": { "message": "Task with id '665f1c2b9a1e4c3d2f0a1b2c' not found", "code": "TASK_NOT_FOUND" }
}
```

A malformed id such as `/api/tasks/abc` returns `400` with `VALIDATION_ERROR`.

### Update a task: `200 OK`

```bash
curl -X PATCH http://localhost:3000/api/tasks/6ac4e2d43591fef1ea3bd9bd \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

```json
{
  "success": true,
  "data": {
    "id": "6ac4e2d43591fef1ea3bd9bd",
    "title": "Write README",
    "description": "Document the API",
    "status": "completed",
    "priority": "high",
    "createdAt": "2026-10-06T12:00:20.857Z",
    "updatedAt": "2026-10-06T12:00:20.961Z"
  }
}
```

### Delete a task: `204 No Content`

```bash
curl -i -X DELETE http://localhost:3000/api/tasks/6ac4e2d43591fef1ea3bd9bd
```

The response has no body. Deleting the same task again returns `404 TASK_NOT_FOUND`.

---

## Extending

- **New feature module:** create `src/modules/<name>/` with the same layers, export a `create<Name>Module()` that returns `{ basePath, router }`, and add it to the `modules` array in `server.ts`.
- **Different storage or tests:** implement `ITaskRepository` (for example, an in-memory repository) and pass it in with `createTaskModule(new InMemoryTaskRepository())`. The service and controller stay unchanged.
