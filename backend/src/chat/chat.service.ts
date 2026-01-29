import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    private projectsService: ProjectsService,
  ) {}

  async createMessage(
    sendMessageDto: SendMessageDto,
    userId: string,
  ): Promise<MessageResponseDto> {
    // Verify user has access to project
    await this.verifyProjectAccess(sendMessageDto.projectId, userId);

    const sanitizedContent = this.sanitizeContent(sendMessageDto.content);

    const message = this.messageRepository.create({
      content: sanitizedContent,
      userId,
      projectId: sendMessageDto.projectId,
    });

    const savedMessage = await this.messageRepository.save(message);
    const user = await this.getUserInfo(savedMessage.userId);

    return this.toResponseDto(savedMessage, user);
  }
  async editMessage(
    messageId: string,
    content: string,
    userId: string,
  ): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('Not authorized to edit this message');
    }

    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit a deleted message');
    }

    const sanitizedContent = this.sanitizeContent(content);

    // Only mark as edited if content actually changed
    if (sanitizedContent !== message.content) {
      message.content = sanitizedContent;
      message.isEdited = true;
      message.editedAt = new Date();
    }

    const updatedMessage = await this.messageRepository.save(message);
    return this.toResponseDto(updatedMessage, message.user);
  }
  async getProjectMessages(
    projectId: string,
    userId: string,
    limit: number = 200,
    before?: string,
  ): Promise<MessageResponseDto[]> {
    // Verify user has access to project
    await this.verifyProjectAccess(projectId, userId);

    // Validate and cap the limit
    const validLimit = Math.min(Math.max(1, limit), 500);

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .where('message.projectId = :projectId', { projectId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false });

    if (before) {
      queryBuilder.andWhere('message.createdAt < :before', {
        before: new Date(before),
      });
    }

    const messages = await queryBuilder
      .orderBy('message.createdAt', 'DESC')
      .take(validLimit)
      .getMany();

    return messages.reverse().map((msg) => this.toResponseDto(msg, msg.user));
  }

  async deleteMessage(
    messageId: string,
    userId: string,
  ): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this message');
    }

    message.isDeleted = true;
    message.content = '[Message deleted]';
    const updatedMessage = await this.messageRepository.save(message);

    return this.toResponseDto(updatedMessage, message.user);
  }

  private toResponseDto(
    message: ChatMessage,
    user: { id: string; name: string; email: string },
  ): MessageResponseDto {
    return {
      id: message.id,
      content: message.content,
      userId: message.userId,
      userName: user?.name || 'Unknown User',
      projectId: message.projectId,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
    };
  }

  private async getUserInfo(
    userId: string,
  ): Promise<{ id: string; name: string; email: string }> {
    const user = await this.messageRepository.manager
      .createQueryBuilder()
      .select(['id', 'name', 'email'])
      .from('users', 'user')
      .where('user.id = :userId', { userId })
      .getRawOne<{ id: string; name: string; email: string }>();

    return user
      ? { id: user.id, name: user.name, email: user.email }
      : { id: userId, name: 'Unknown User', email: '' };
  }

  private sanitizeContent(content: string): string {
    // Remove potentially dangerous HTML/script tags
    return content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  private async verifyProjectAccess(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.projectsService.findOne(projectId);

    // Check if user is a member of the project
    const isMember = project.members.some((member) => member.userId === userId);

    if (!isMember) {
      throw new NotFoundException('You are not a member of this project');
    }
  }
}
