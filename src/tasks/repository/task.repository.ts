import { TaskEntity } from '../models/task.entity';

export interface TaskRepository {
  findById(id: string): Promise<TaskEntity | null>;
  findAll(params: {
    page: number;
    limit: number;
    status?: TaskEntity['status'];
    assigneeId?: string;
  }): Promise<{ data: TaskEntity[]; total: number }>;
  create(task: TaskEntity): Promise<TaskEntity>;
  update(id: string, updates: Partial<TaskEntity>): Promise<TaskEntity | null>;
  delete(id: string): Promise<boolean>;
}
