import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Create a new project
   * POST /projects
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new project',
    description:
      'Create a new project and automatically add the creator as admin',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        title: 'Build a Rocket to Mars',
        description:
          'Design and launch a sustainable rocket for Mars colonization',
        createdBy: {
          id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
          email: 'elon@spacex.com',
          name: 'Elon Musk',
        },
        members: [
          {
            userId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
            role: 'admin',
          },
        ],
        createdAt: '2026-01-16T10:00:00Z',
        updatedAt: '2026-01-16T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  /**
   * Get all projects where user is a member
   * GET /projects
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user projects',
    description:
      'Retrieve all projects where the authenticated user is a member',
  })
  @ApiResponse({
    status: 200,
    description: 'List of projects retrieved successfully',
    schema: {
      example: [
        {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          title: 'Build a Rocket to Mars',
          description: 'Design and launch a sustainable rocket',
          createdBy: {
            id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
            email: 'elon@spacex.com',
            name: 'Elon Musk',
          },
          members: [
            {
              userId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
              role: 'admin',
            },
          ],
          createdAt: '2026-01-16T10:00:00Z',
          updatedAt: '2026-01-16T10:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser('id') userId: string) {
    return this.projectsService.findAll(userId);
  }

  /**
   * Get all projects (admin endpoint)
   * GET /projects/all
   */
  @Get('all')
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Retrieve all projects in the system (admin/debug endpoint)',
  })
  @ApiResponse({ status: 200, description: 'Returns all projects' })
  findAllProjects() {
    return this.projectsService.findAllProjects();
  }

  /**
   * Get a single project by ID
   * GET /projects/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a project by ID',
    description: 'Retrieve detailed information about a specific project',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        title: 'Build a Rocket to Mars',
        description:
          'Design and launch a sustainable rocket for Mars colonization',
        createdBy: {
          id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
          email: 'elon@spacex.com',
          name: 'Elon Musk',
        },
        members: [
          {
            userId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
            role: 'admin',
          },
        ],
        createdAt: '2026-01-16T10:00:00Z',
        updatedAt: '2026-01-16T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  /**
   * Update a project
   * PATCH /projects/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a project',
    description:
      'Update project title and/or description. Requires admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        title: 'Build TWO Rockets to Mars',
        description: 'Expanded mission: Now building two rockets',
        createdBy: {
          id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
          email: 'elon@spacex.com',
          name: 'Elon Musk',
        },
        members: [
          {
            userId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
            role: 'admin',
          },
        ],
        createdAt: '2026-01-16T10:00:00Z',
        updatedAt: '2026-01-16T14:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  /**
   * Delete a project
   * DELETE /projects/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Permanently delete a project and all associated data. Requires admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({ status: 204, description: 'Project deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.projectsService.remove(id, userId);
  }

  /**
   * Add a member to the project
   * POST /projects/:id/members
   */
  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a member to the project',
    description:
      'Add a new member with a specific role to the project. Requires admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
    schema: {
      example: {
        userId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
        role: 'member',
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Project or user not found' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  addMember(
    @Param('id') projectId: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.addMember(projectId, addMemberDto, userId);
  }

  /**
   * Remove a member from the project
   * DELETE /projects/:id/members/:memberId
   */
  @Delete(':id/members/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a member from the project',
    description: 'Remove a user from project membership. Requires admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiParam({
    name: 'memberId',
    description: 'User UUID to remove',
    example: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Project or member not found' })
  async removeMember(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.projectsService.removeMember(projectId, memberId, userId);
  }

  /**
   * Update member role
   * PATCH /projects/:id/members/:memberId
   */
  @Patch(':id/members/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update member role',
    description: "Change a member's role in the project. Requires admin role.",
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiParam({
    name: 'memberId',
    description: 'User UUID whose role to update',
    example: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  })
  @ApiResponse({
    status: 200,
    description: 'Member role updated successfully',
    schema: {
      example: {
        userId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
        role: 'admin',
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Project or member not found' })
  updateMemberRole(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.updateMemberRole(
      projectId,
      memberId,
      updateMemberRoleDto,
      userId,
    );
  }

  /**
   * Get user's role in a project
   * GET /projects/:id/role
   */
  @Get(':id/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user role in project',
    description: "Retrieve the authenticated user's role in a specific project",
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'User role retrieved successfully',
    schema: {
      example: {
        role: 'admin',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getUserRole(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.getUserRole(projectId, userId);
  }
}
