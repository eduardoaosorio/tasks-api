import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { TaskEntity, TaskStatus, Priority } from './models/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import type { TaskRepository } from './repository/task.repository';
import { TaskEventsPublisher } from '../messaging/task-events.publisher';
import { pickDefined } from '../shared/object.utils';

@Injectable()
export class TaskService {
  constructor(
    @Inject('TaskRepository') private readonly repo: TaskRepository,
    private readonly publisher: TaskEventsPublisher,
  ) {}

  async list(dto: QueryTasksDto) {
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
    // TODO make part of DTO validation logic
    if (dto.dueDate && new Date(dto.dueDate).getTime() <= Date.now()) {
      throw new BadRequestException('dueDate must be in the future');
    }

    const now = new Date().toISOString();
    const entity: TaskEntity = {
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
    } as TaskEntity;

    const created = await this.repo.create(entity);
    this.publisher.publishTaskCreated({
      type: 'task.created',
      task: created,
    });
    return created;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    // TODO make part of DTO validation logic
    if (dto.dueDate && new Date(dto.dueDate).getTime() <= Date.now()) {
      throw new BadRequestException('dueDate must be in the future');
    }

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
