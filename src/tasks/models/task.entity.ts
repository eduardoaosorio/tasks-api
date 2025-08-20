import { Exclude } from 'class-transformer';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class TaskEntity {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  projectId: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  dueDate?: string; // ISO 8601
  tags: string[];

  // excluding metadata just to showcase global ClassSerializerInterceptor functionality
  @Exclude()
  metadata: Record<string, unknown>;

  constructor(partial: Partial<TaskEntity>) {
    Object.assign(this, partial);
  }
}
