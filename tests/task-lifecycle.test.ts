import { describe, it, expect, beforeEach } from 'vitest';
import { TaskManager } from '@/lib/tasks/lifecycle';
import type { TaskEvent } from '@/types/task';

describe('TaskManager', () => {
  let manager: TaskManager;

  beforeEach(() => {
    manager = new TaskManager();
  });

  it('creates a task with pending status', () => {
    const task = manager.create({
      name: 'Test Task',
      description: 'A test task',
      type: 'mcp',
    });

    expect(task.id).toBeDefined();
    expect(task.status).toBe('pending');
    expect(task.createdAt).toBeInstanceOf(Date);
  });

  it('starts a task and updates status to running', () => {
    const task = manager.create({
      name: 'Test Task',
      type: 'mcp',
    });

    const started = manager.start(task.id);

    expect(started?.status).toBe('running');
    expect(started?.startedAt).toBeInstanceOf(Date);
  });

  it('finishes a task with result', () => {
    const task = manager.create({
      name: 'Test Task',
      type: 'mcp',
    });

    manager.start(task.id);
    const finished = manager.finish(task.id, { data: 'result' });

    expect(finished?.status).toBe('completed');
    expect(finished?.result).toEqual({ data: 'result' });
    expect(finished?.completedAt).toBeInstanceOf(Date);
  });

  it('handles task errors', () => {
    const task = manager.create({
      name: 'Test Task',
      type: 'mcp',
    });

    manager.start(task.id);
    const failed = manager.error(task.id, 'Something went wrong');

    expect(failed?.status).toBe('failed');
    expect(failed?.error).toBe('Something went wrong');
  });

  it('emits events on task lifecycle changes', () => {
    const events: TaskEvent[] = [];
    manager.onEvent((event) => events.push(event));

    const task = manager.create({
      name: 'Test Task',
      type: 'mcp',
    });

    manager.start(task.id);
    manager.finish(task.id);

    expect(events).toHaveLength(3);
    expect(events[0].type).toBe('created');
    expect(events[1].type).toBe('started');
    expect(events[2].type).toBe('finished');
  });

  it('filters tasks by status', () => {
    manager.create({ name: 'Task 1', type: 'mcp' });
    const task2 = manager.create({ name: 'Task 2', type: 'mcp' });
    manager.start(task2.id);

    const pending = manager.getAll('pending');
    const running = manager.getAll('running');

    expect(pending).toHaveLength(1);
    expect(running).toHaveLength(1);
  });
});
