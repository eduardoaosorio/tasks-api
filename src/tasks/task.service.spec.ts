import { Test } from '@nestjs/testing';
import { TaskService } from './task.service';
import { InMemoryTaskRepository } from './repository/inmemory-task.repository';
import { TaskEventsPublisher } from '../messaging/task-events.publisher';
import { Priority, TaskStatus } from './models/task.entity';

class PublisherStub {
  // no-op implementations
  publishTaskCreated(): void {}
  publishTaskUpdated(): void {}
  publishTaskStatusChanged(): void {}
  publishTaskDeleted(): void {}
}

// TODO update tests
describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TaskService,
        InMemoryTaskRepository,
        { provide: 'TaskRepository', useExisting: InMemoryTaskRepository },
        { provide: TaskEventsPublisher, useClass: PublisherStub },
      ],
    }).compile();

    service = module.get(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('updates only provided fields and preserves others', async () => {
    const created = await service.create({
      title: 'A',
      description: 'desc',
      assigneeId: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      priority: Priority.HIGH,
      status: TaskStatus.PENDING,
      tags: ['x'],
      metadata: { a: 1 },
    });

    const updated = await service.update(created.id, { title: 'B' });

    expect(updated.title).toBe('B');
    expect(updated.description).toBe('desc');
    expect(updated.assigneeId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(updated.projectId).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(updated.priority).toBe(Priority.HIGH);
    expect(updated.status).toBe(TaskStatus.PENDING);
    expect(updated.tags).toEqual(['x']);
    expect(updated.metadata).toEqual({ a: 1 });
  });
});
