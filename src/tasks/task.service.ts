import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { TaskEntity, TaskStatus, Priority } from './models/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { TaskEventsPublisher } from '../messaging/task-events.publisher';
import { pickDefined } from '../shared/object.utils';
import { InMemoryTaskRepository } from './repository/inmemory-task.repository';
import { PaginatedResult } from 'src/shared/types';

@Injectable()
export class TaskService {
  constructor(
    private readonly repo: InMemoryTaskRepository,
    private readonly publisher: TaskEventsPublisher,
  ) {}

  async list(dto: QueryTasksDto): Promise<PaginatedResult<TaskEntity>> {
    const { data, total } = await this.repo.findAll({
      page: dto.page,
      limit: dto.limit,
      status: dto.status,
      assigneeId: dto.assigneeId,
    });
    const totalPages = Math.ceil(total / dto.limit) || 1;
    return {
      data,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages,
        hasNext: dto.page < totalPages,
        hasPrev: dto.page > 1,
      },
    };
  }

  async getById(id: string): Promise<TaskEntity> {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Task not found');
    return found;
  }

  async create(dto: CreateTaskDto): Promise<TaskEntity> {
    const now = new Date().toISOString();
    const created = await this.repo.create({
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? TaskStatus.PENDING,
      priority: dto.priority ?? Priority.MEDIUM,
      assigneeId: dto.assigneeId,
      projectId: dto.projectId,
      createdAt: now,
      updatedAt: now,
      dueDate: dto.dueDate,
      tags: dto.tags ?? [],
      metadata: dto.metadata ?? {},
    });
    this.publisher.publishTaskCreated({
      type: 'task.created',
      task: created,
    });
    return created;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Task not found');
    const updatedAt = new Date().toISOString();
    const definedUpdates = pickDefined(dto as Record<string, unknown>);
    const updates: Partial<TaskEntity> = {
      ...(definedUpdates as Partial<TaskEntity>),
      updatedAt,
    };
    const updated = await this.repo.update(id, updates);
    if (!updated) throw new NotFoundException('Task not found');

    const changedFields = Object.keys(definedUpdates);
    this.publisher.publishTaskUpdated({
      type: 'task.updated',
      task: updated,
      changedFields,
    });

    if (dto.status && dto.status !== existing.status) {
      this.publisher.publishTaskStatusChanged({
        type: 'task.status_changed',
        taskId: id,
        oldStatus: existing.status,
        newStatus: dto.status,
        timestamp: updatedAt,
      });
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('Task not found');
    this.publisher.publishTaskDeleted({
      type: 'task.deleted',
      taskId: id,
      deletedAt: new Date().toISOString(),
    });
  }
}
