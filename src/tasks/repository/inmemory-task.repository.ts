import { Injectable } from '@nestjs/common';
import { TaskEntity, TaskStatus } from '../models/task.entity';
import { TaskRepository } from './task.repository';

@Injectable()
export class InMemoryTaskRepository implements TaskRepository {
  private readonly store = new Map<string, TaskEntity>();

  findById(id: string): Promise<TaskEntity | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findAll(params: {
    page: number;
    limit: number;
    status?: TaskStatus;
    assigneeId?: string;
  }): Promise<{ data: TaskEntity[]; total: number }> {
    const { page, limit, status, assigneeId } = params;
    const all = Array.from(this.store.values());
    const filtered = all.filter((t) => {
      if (status && t.status !== status) return false;
      if (assigneeId && t.assigneeId !== assigneeId) return false;
      return true;
    });
    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    return Promise.resolve({ data, total });
  }

  create(task: TaskEntity): Promise<TaskEntity> {
    this.store.set(task.id, task);
    return Promise.resolve(task);
  }

  update(id: string, updates: Partial<TaskEntity>): Promise<TaskEntity | null> {
    const existing = this.store.get(id);
    if (!existing) return Promise.resolve(null);
    const updated: TaskEntity = { ...existing, ...updates };
    this.store.set(id, updated);
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.store.delete(id));
  }
}
