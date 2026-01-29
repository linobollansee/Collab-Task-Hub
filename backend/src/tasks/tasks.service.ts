import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    return this.taskRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['project', 'assignee'],
    });
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { projectId },
      relations: ['project', 'assignee'],
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'assignee'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // Filter out undefined values to avoid overwriting with null
    const updates = Object.entries(updateTaskDto).reduce<
      Record<string, unknown>
    >((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    Object.assign(task, updates);
    await this.taskRepository.save(task);

    // Reload task with all relations
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}
