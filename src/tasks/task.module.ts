import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { InMemoryTaskRepository } from './repository/inmemory-task.repository';
import { TaskEventsPublisher } from '../messaging/task-events.publisher';

@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskEventsPublisher, InMemoryTaskRepository],
})
export class TaskModule {}
