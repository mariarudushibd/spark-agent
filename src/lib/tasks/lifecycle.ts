import type { Task, TaskStatus, TaskEvent } from '@/types/task';

/**
 * Task Lifecycle API
 * Manages subagent task creation, execution, and coordination
 */

type TaskEventHandler = (event: TaskEvent) => void;

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private eventHandlers: TaskEventHandler[] = [];

  /**
   * Subscribe to task lifecycle events
   */
  onEvent(handler: TaskEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
    };
  }

  private emit(event: TaskEvent): void {
    this.eventHandlers.forEach((handler) => handler(event));
  }

  /**
   * Create a new task
   */
  create(task: Omit<Task, 'id' | 'status' | 'createdAt'>): Task {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };

    this.tasks.set(newTask.id, newTask);
    this.emit({ type: 'created', task: newTask });

    return newTask;
  }

  /**
   * Start a task
   */
  start(taskId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      status: 'running',
      startedAt: new Date(),
    };

    this.tasks.set(taskId, updatedTask);
    this.emit({ type: 'started', task: updatedTask });

    return updatedTask;
  }

  /**
   * Update task progress
   */
  update(taskId: string, progress: Partial<Task>): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask: Task = { ...task, ...progress };
    this.tasks.set(taskId, updatedTask);
    this.emit({ type: 'updated', task: updatedTask });

    return updatedTask;
  }

  /**
   * Complete a task
   */
  finish(taskId: string, result?: unknown): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      status: 'completed',
      completedAt: new Date(),
      result,
    };

    this.tasks.set(taskId, updatedTask);
    this.emit({ type: 'finished', task: updatedTask });

    return updatedTask;
  }

  /**
   * Mark task as failed
   */
  error(taskId: string, error: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      status: 'failed',
      completedAt: new Date(),
      error,
    };

    this.tasks.set(taskId, updatedTask);
    this.emit({ type: 'error', task: updatedTask, error });

    return updatedTask;
  }

  /**
   * Get task by ID
   */
  get(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks with optional status filter
   */
  getAll(status?: TaskStatus): Task[] {
    const tasks = Array.from(this.tasks.values());
    return status ? tasks.filter((t) => t.status === status) : tasks;
  }
}

export const taskManager = new TaskManager();
