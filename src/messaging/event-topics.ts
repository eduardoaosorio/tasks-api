export const TASK_LIFECYCLE_TOPIC = 'task-lifecycle';
export const TASK_STATUS_TOPIC = 'task-status';

export type TaskCreatedEvent = {
  type: 'task.created';
  task: unknown;
};

export type TaskUpdatedEvent = {
  type: 'task.updated';
  task: unknown;
  changedFields?: string[];
};

export type TaskStatusChangedEvent = {
  type: 'task.status_changed';
  taskId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
};

export type TaskDeletedEvent = {
  type: 'task.deleted';
  taskId: string;
  deletedAt: string;
};
