# Task Management API Documentation

**Project:** Manager - Task Management & AI Planning PWA  
**Version:** 1.0  
**Date:** 2025-12-09

---

## Overview

The Task Management API provides RESTful endpoints for creating, reading, updating, and deleting tasks. All endpoints require authentication and enforce Row Level Security (RLS) to ensure users can only access their own tasks.

**Base URL:** `http://localhost:3000/api`

---

## Authentication

All API endpoints require authentication. The user's session is automatically managed via secure cookies set by the authentication system.

**Authentication Method:** Cookie-based (HTTP-only)

If a request is made without authentication, the API returns:
```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```
**Status Code:** 401

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

---

## Endpoints

### 1. Get All Tasks

**Endpoint:** `GET /api/tasks`

**Description:** Retrieve all tasks for the authenticated user.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `pending`, `in_progress`, `completed`, `cancelled` |
| `priority` | number | No | Filter by minimum priority (0-100) |
| `limit` | number | No | Maximum number of tasks to return (default: 100) |
| `offset` | number | No | Number of tasks to skip for pagination (default: 0) |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/tasks?status=pending&priority=5&limit=20" \
  -H "Cookie: sb-auth-token=..."
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-123",
      "title": "Complete project proposal",
      "description": "Finish the Q4 project proposal",
      "status": "in_progress",
      "priority": 10,
      "deadline": "2025-12-15T17:00:00.000Z",
      "created_at": "2025-12-09T10:00:00.000Z",
      "updated_at": "2025-12-09T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "user-123",
      "title": "Review team feedback",
      "description": null,
      "status": "pending",
      "priority": 5,
      "deadline": "2025-12-12T17:00:00.000Z",
      "created_at": "2025-12-09T09:00:00.000Z",
      "updated_at": "2025-12-09T09:00:00.000Z"
    }
  ],
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Tasks retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### 2. Create Task

**Endpoint:** `POST /api/tasks`

**Description:** Create a new task for the authenticated user.

**Request Body:**

```json
{
  "title": "string (required, 1-255 characters)",
  "description": "string (optional, max 1000 characters)",
  "priority": "number (optional, 0-100, default: 0)",
  "deadline": "string (optional, ISO 8601 datetime)"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-auth-token=..." \
  -d '{
    "title": "Implement user dashboard",
    "description": "Create the main dashboard page with task overview",
    "priority": 8,
    "deadline": "2025-12-20T17:00:00.000Z"
  }'
```

**Example Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "user_id": "user-123",
    "title": "Implement user dashboard",
    "description": "Create the main dashboard page with task overview",
    "status": "pending",
    "priority": 8,
    "deadline": "2025-12-20T17:00:00.000Z",
    "created_at": "2025-12-09T10:30:00.000Z",
    "updated_at": "2025-12-09T10:30:00.000Z"
  },
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

**Status Codes:**
- `201 Created` - Task created successfully
- `400 Bad Request` - Invalid input (validation error)
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Server error

**Validation Errors:**

```json
{
  "success": false,
  "error": "Title is required",
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

---

### 3. Get Single Task

**Endpoint:** `GET /api/tasks/:id`

**Description:** Retrieve a specific task by ID.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID (UUID) |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000" \
  -H "Cookie: sb-auth-token=..."
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "title": "Complete project proposal",
    "description": "Finish the Q4 project proposal",
    "status": "in_progress",
    "priority": 10,
    "deadline": "2025-12-15T17:00:00.000Z",
    "created_at": "2025-12-09T10:00:00.000Z",
    "updated_at": "2025-12-09T10:30:00.000Z"
  },
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Task retrieved successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Task not found or user doesn't have access
- `500 Internal Server Error` - Server error

---

### 4. Update Task

**Endpoint:** `PUT /api/tasks/:id`

**Description:** Update a specific task.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID (UUID) |

**Request Body:**

```json
{
  "title": "string (optional, 1-255 characters)",
  "description": "string (optional, max 1000 characters)",
  "status": "string (optional, one of: pending, in_progress, completed, cancelled)",
  "priority": "number (optional, 0-100)",
  "deadline": "string (optional, ISO 8601 datetime)"
}
```

**Example Request:**

```bash
curl -X PUT "http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-auth-token=..." \
  -d '{
    "status": "completed",
    "priority": 5
  }'
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "title": "Complete project proposal",
    "description": "Finish the Q4 project proposal",
    "status": "completed",
    "priority": 5,
    "deadline": "2025-12-15T17:00:00.000Z",
    "created_at": "2025-12-09T10:00:00.000Z",
    "updated_at": "2025-12-09T10:35:00.000Z"
  },
  "timestamp": "2025-12-09T10:35:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Task updated successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Task not found or user doesn't have access
- `500 Internal Server Error` - Server error

---

### 5. Delete Task

**Endpoint:** `DELETE /api/tasks/:id`

**Description:** Delete a specific task.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID (UUID) |

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000" \
  -H "Cookie: sb-auth-token=..."
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  },
  "timestamp": "2025-12-09T10:35:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Task deleted successfully
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Task not found or user doesn't have access
- `500 Internal Server Error` - Server error

---

## Data Types

### Task Object

```typescript
interface Task {
  id: string;                    // UUID
  user_id: string;               // UUID of task owner
  title: string;                 // 1-255 characters
  description: string | null;    // Optional, max 1000 characters
  status: TaskStatus;            // pending | in_progress | completed | cancelled
  priority: number;              // 0-100
  deadline: string | null;       // ISO 8601 datetime or null
  created_at: string;            // ISO 8601 datetime
  updated_at: string;            // ISO 8601 datetime
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
```

---

## Error Handling

### Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": "Title is required",
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Task not found",
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to fetch tasks",
  "timestamp": "2025-12-09T10:30:00.000Z"
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get all tasks
const response = await fetch('/api/tasks');
const { data: tasks } = await response.json();

// Create a task
const createResponse = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New task',
    priority: 5,
  }),
});
const { data: newTask } = await createResponse.json();

// Update a task
const updateResponse = await fetch(`/api/tasks/${taskId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'completed',
  }),
});
const { data: updatedTask } = await updateResponse.json();

// Delete a task
await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
```

### cURL

```bash
# Get all tasks
curl http://localhost:3000/api/tasks

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New task","priority":5}'

# Update a task
curl -X PUT http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete a task
curl -X DELETE http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. This may be added in future versions.

---

## Pagination

Use `limit` and `offset` query parameters for pagination:

```bash
# Get first 20 tasks
curl http://localhost:3000/api/tasks?limit=20&offset=0

# Get next 20 tasks
curl http://localhost:3000/api/tasks?limit=20&offset=20
```

---

## Filtering

### By Status

```bash
curl http://localhost:3000/api/tasks?status=pending
curl http://localhost:3000/api/tasks?status=in_progress
curl http://localhost:3000/api/tasks?status=completed
curl http://localhost:3000/api/tasks?status=cancelled
```

### By Priority

```bash
# Get tasks with priority >= 5
curl http://localhost:3000/api/tasks?priority=5
```

### Combined Filters

```bash
curl http://localhost:3000/api/tasks?status=pending&priority=5&limit=10
```

---

## Sorting

Tasks are automatically sorted by:
1. Deadline (ascending, null values last)
2. Priority (descending)

This ensures urgent, deadline-driven tasks appear first.

---

## Security

### Row Level Security (RLS)

All database operations enforce RLS policies:
- Users can only read their own tasks
- Users can only create tasks for themselves
- Users can only update their own tasks
- Users can only delete their own tasks

### Input Validation

All inputs are validated using Zod schemas:
- Title: Required, 1-255 characters
- Description: Optional, max 1000 characters
- Priority: Optional, 0-100
- Status: Must be one of the allowed values
- Deadline: Optional, must be valid ISO 8601 datetime

### Authentication

All endpoints require valid authentication via secure cookies. Requests without valid authentication are rejected with 401 Unauthorized.

---

## Changelog

### Version 1.0 (2025-12-09)

- Initial API implementation
- CRUD endpoints for tasks
- Query parameter filtering
- Input validation with Zod
- Consistent response format
- Error handling with appropriate HTTP status codes

---

## Support

For issues or questions about the API, please refer to:
- [Project Documentation](./IMPLEMENTATION_GUIDE.md)
- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md)
- [Supabase Documentation](https://supabase.com/docs)
