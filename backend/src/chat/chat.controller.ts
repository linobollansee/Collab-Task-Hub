import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { EditMessageDto } from './dto/edit-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  @Get('projects/:projectId/messages')
  @ApiOperation({
    summary: 'Get project messages',
    description:
      'Retrieve chat messages for a project with optional pagination using limit and before cursor',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of messages to return (default: 200)',
    example: 50,
    type: Number,
  })
  @ApiQuery({
    name: 'before',
    required: false,
    description:
      'Message ID cursor for pagination - returns messages before this ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [MessageResponseDto],
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          content: "Hello team! Let's discuss the project requirements.",
          userId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
          userName: 'John Doe',
          projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          isEdited: false,
          isDeleted: false,
          createdAt: '2026-01-21T10:30:00Z',
          editedAt: null,
        },
        {
          id: '234e5678-e89b-12d3-a456-426614174001',
          content: "Great idea! I'll start working on the backend.",
          userId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
          userName: 'Jane Smith',
          projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          isEdited: false,
          isDeleted: false,
          createdAt: '2026-01-21T10:32:00Z',
          editedAt: null,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectMessages(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.chatService.getProjectMessages(
      projectId,
      userId,
      limit ? +limit : 200,
      before,
    );
  }

  @Patch('messages/:messageId')
  @ApiOperation({
    summary: 'Edit a message',
    description:
      'Update the content of a message. Only the message author can edit their messages.',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Message UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
    type: MessageResponseDto,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'This is the edited message content',
        userId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        userName: 'John Doe',
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        isEdited: true,
        isDeleted: false,
        createdAt: '2026-01-21T10:30:00Z',
        editedAt: '2026-01-21T11:45:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the message author',
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() editMessageDto: EditMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    const message = await this.chatService.editMessage(
      messageId,
      editMessageDto.content,
      userId,
    );

    // Broadcast to all users in the project room via WebSocket
    this.chatGateway.broadcastMessageEdited(message);

    return message;
  }

  @Delete('messages/:messageId')
  @ApiOperation({
    summary: 'Delete a message',
    description:
      'Soft delete a message (marks as deleted). Only the message author can delete their messages.',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Message UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the message author',
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    const message = await this.chatService.deleteMessage(messageId, userId);

    // Broadcast to all users in the project room via WebSocket
    this.chatGateway.broadcastMessageDeleted(message);

    return message;
  }
}
