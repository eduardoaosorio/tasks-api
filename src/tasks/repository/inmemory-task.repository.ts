import { Injectable } from '@nestjs/common';
import { TaskEntity, TaskStatus } from '../models/task.entity';

import { BaseFilters, BaseRepository } from 'src/shared/base.repository';

export interface TaskFilters extends BaseFilters {
  status?: TaskStatus;
  assigneeId?: string;
}

@Injectable()
export class InMemoryTaskRepository
  implements BaseRepository<TaskEntity, string, TaskFilters>
{
  private readonly store = new Map<string, TaskEntity>();

  findById(id: string): Promise<TaskEntity | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findAll({ page, limit, status, assigneeId }: TaskFilters) {
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

  create(payload: TaskEntity): Promise<TaskEntity> {
    const task = new TaskEntity(payload);
    this.store.set(task.id, task);
    return Promise.resolve(task);
  }

  update(id: string, updates: Partial<TaskEntity>): Promise<TaskEntity | null> {
    const existing = this.store.get(id);
    if (!existing) return Promise.resolve(null);
    const updated = new TaskEntity({ ...existing, ...updates });
    this.store.set(id, updated);
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.store.delete(id));
  }
}
