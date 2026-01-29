import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectMember, ProjectRole } from './project.entity';
import { Task } from '../tasks/task.entity';
import { ChatMessage } from '../chat/message.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
  ) {}

  /**
   * Create a new project and automatically assign the creator as admin
   */
  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    // Create the project
    const project = this.projectRepository.create({
      ...createProjectDto,
      createdById: userId,
    });

    const savedProject = await this.projectRepository.save(project);

    // Automatically assign creator as admin
    const adminMember = this.projectMemberRepository.create({
      projectId: savedProject.id,
      userId: userId,
      role: ProjectRole.ADMIN,
    });

    await this.projectMemberRepository.save(adminMember);

    // Reload project with members
    return this.findOne(savedProject.id);
  }

  /**
   * Get all projects where user is a member
   */
  async findAll(userId: string): Promise<Project[]> {
    const members = await this.projectMemberRepository.find({
      where: { userId },
      relations: ['project', 'project.createdBy', 'project.members'],
    });

    return members.map((member) => member.project);
  }

  /**
   * Get all projects (admin only)
   */
  async findAllProjects(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['createdBy', 'members', 'members.user'],
    });
  }

  /**
   * Get a single project by ID
   */
  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['createdBy', 'members', 'members.user'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  /**
   * Update a project (only admins can update)
   */
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id);

    // Check if user is admin
    await this.checkUserRole(id, userId, [ProjectRole.ADMIN]);

    // Update the project
    Object.assign(project, updateProjectDto);
    await this.projectRepository.save(project);

    return this.findOne(id);
  }

  /**
   * Delete a project (only admins can delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id);

    // Check if user is admin
    await this.checkUserRole(id, userId, [ProjectRole.ADMIN]);

    // Check for existing tasks
    const taskCount = await this.taskRepository.count({
      where: { projectId: id },
    });

    if (taskCount > 0) {
      throw new BadRequestException(
        `Cannot delete project with existing tasks. Please delete all ${taskCount} task(s) first.`,
      );
    }

    await this.projectRepository.remove(project);
  }

  /**
   * Add a member to the project
   */
  async addMember(
    projectId: string,
    addMemberDto: AddMemberDto,
    requestingUserId: string,
  ): Promise<ProjectMember> {
    // Check if requesting user is admin
    await this.checkUserRole(projectId, requestingUserId, [ProjectRole.ADMIN]);

    // Check if user is already a member
    const existingMember = await this.projectMemberRepository.findOne({
      where: {
        projectId,
        userId: addMemberDto.userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this project');
    }

    const member = this.projectMemberRepository.create({
      projectId,
      userId: addMemberDto.userId,
      role: addMemberDto.role,
    });

    return this.projectMemberRepository.save(member);
  }

  /**
   * Remove a member from the project
   */
  async removeMember(
    projectId: string,
    memberId: string,
    requestingUserId: string,
  ): Promise<void> {
    // Check if requesting user is admin
    await this.checkUserRole(projectId, requestingUserId, [ProjectRole.ADMIN]);

    const member = await this.projectMemberRepository.findOne({
      where: { id: memberId, projectId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this project');
    }

    // Prevent removing the last admin
    const admins = await this.projectMemberRepository.count({
      where: {
        projectId,
        role: ProjectRole.ADMIN,
      },
    });

    if (member.role === ProjectRole.ADMIN && admins <= 1) {
      throw new BadRequestException(
        'Cannot remove the last admin from the project',
      );
    }

    await this.projectMemberRepository.remove(member);
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    projectId: string,
    memberId: string,
    updateMemberRoleDto: UpdateMemberRoleDto,
    requestingUserId: string,
  ): Promise<ProjectMember> {
    // Check if requesting user is admin
    await this.checkUserRole(projectId, requestingUserId, [ProjectRole.ADMIN]);

    const member = await this.projectMemberRepository.findOne({
      where: { id: memberId, projectId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this project');
    }

    // Prevent demoting the last admin
    if (
      member.role === ProjectRole.ADMIN &&
      updateMemberRoleDto.role !== ProjectRole.ADMIN
    ) {
      const admins = await this.projectMemberRepository.count({
        where: {
          projectId,
          role: ProjectRole.ADMIN,
        },
      });

      if (admins <= 1) {
        throw new BadRequestException(
          'Cannot demote the last admin of the project',
        );
      }
    }

    member.role = updateMemberRoleDto.role;
    return this.projectMemberRepository.save(member);
  }

  /**
   * Get user's role in a project
   */
  async getUserRole(
    projectId: string,
    userId: string,
  ): Promise<{ role: ProjectRole }> {
    // First check if project exists
    const projectExists = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!projectExists) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return { role: member.role };
  }

  /**
   * Check if user has one of the required roles
   */
  private async checkUserRole(
    projectId: string,
    userId: string,
    requiredRoles: ProjectRole[],
  ): Promise<void> {
    const userRole = await this.getUserRole(projectId, userId);

    if (!requiredRoles.includes(userRole.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
  }

  /**
   * Check if user is a member of the project
   */
  async checkMembership(projectId: string, userId: string): Promise<boolean> {
    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    return !!member;
  }
}
