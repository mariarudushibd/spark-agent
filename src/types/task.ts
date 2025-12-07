/**
 * Task Types
 * Defines interfaces for task lifecycle management
 */

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type TaskType = 'plan' | 'mcp' | 'subagent';

export interface Task {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  parentId?: string;
  metadata?: Record<string, unknown>;
  result?: unknown;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type TaskEventType = 'created' | 'started' | 'updated' | 'finished' | 'error';

export interface TaskEvent {
  type: TaskEventType;
  task: Task;
  error?: string;
}
