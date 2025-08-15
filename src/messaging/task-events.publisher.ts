import { Injectable, Logger } from '@nestjs/common';
import {
  TASK_LIFECYCLE_TOPIC,
  TASK_STATUS_TOPIC,
  TaskCreatedEvent,
  TaskDeletedEvent,
  TaskStatusChangedEvent,
  TaskUpdatedEvent,
} from './event-topics';

@Injectable()
export class TaskEventsPublisher {
  private readonly logger = new Logger(TaskEventsPublisher.name);

  publishTaskCreated(event: TaskCreatedEvent): void {
    this.logger.log(
      `Publish to ${TASK_LIFECYCLE_TOPIC}: ${JSON.stringify(event, null, 2)}`,
    );
  }

  publishTaskUpdated(event: TaskUpdatedEvent): void {
    this.logger.log(
      `Publish to ${TASK_LIFECYCLE_TOPIC}: ${JSON.stringify(event, null, 2)}`,
    );
  }

  publishTaskStatusChanged(event: TaskStatusChangedEvent): void {
    this.logger.log(
      `Publish to ${TASK_STATUS_TOPIC}: ${JSON.stringify(event, null, 2)}`,
    );
  }

  publishTaskDeleted(event: TaskDeletedEvent): void {
    this.logger.log(
      `Publish to ${TASK_LIFECYCLE_TOPIC}: ${JSON.stringify(event, null, 2)}`,
    );
  }
}
