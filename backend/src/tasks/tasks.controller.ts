import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Create a new task and assign it to a project',
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Implement user authentication',
        description:
          'Add JWT-based authentication with login and register endpoints',
        status: 'backlog',
        priority: 'high',
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        assigneeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        createdAt: '2026-01-16T10:00:00Z',
        updatedAt: '2026-01-16T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project or assignee not found' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks',
    description: 'Retrieve all tasks, optionally filtered by project ID',
  })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'Filter tasks by project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tasks retrieved successfully',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Implement user authentication',
          description: 'Add JWT-based authentication',
          status: 'in_progress',
          priority: 'high',
          projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          assigneeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
          createdAt: '2026-01-16T10:00:00Z',
          updatedAt: '2026-01-16T11:30:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.tasksService.findByProject(projectId);
    }
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a task by ID',
    description: 'Retrieve a single task by its UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication',
        status: 'in_progress',
        priority: 'high',
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        assigneeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        createdAt: '2026-01-16T10:00:00Z',
        updatedAt: '2026-01-16T11:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a task',
    description:
      'Update task properties (title, description, status, priority, assignee)',
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Complete user authentication',
        description: 'Finalize JWT authentication with refresh token support',
        status: 'review',
        priority: 'medium',
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        assigneeId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        createdAt: '2026-01-16T10:00:00Z',
        updatedAt: '2026-01-16T15:45:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a task',
    description: 'Permanently delete a task by its UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
