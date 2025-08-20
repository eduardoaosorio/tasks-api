import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsObject,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Priority, TaskStatus } from '../models/task.entity';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description: string = '';

  @IsEnum(TaskStatus)
  status: TaskStatus = TaskStatus.PENDING;

  @IsEnum(Priority)
  priority: Priority = Priority.MEDIUM;

  @IsUUID('4')
  assigneeId!: string;

  @IsUUID('4')
  projectId!: string;

  @ValidateIf((o: Partial<CreateTaskDto>) => o.dueDate !== undefined)
  @IsISO8601()
  dueDate?: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags: string[] = [];

  @IsOptional()
  @IsObject()
  metadata: Record<string, unknown> = {};
}
