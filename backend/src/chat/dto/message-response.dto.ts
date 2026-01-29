import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Message content',
    example: "Hello team! Let's discuss the project requirements.",
  })
  content: string;

  @ApiProperty({
    description: 'UUID of the user who sent the message',
    example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  userId: string;

  @ApiProperty({
    description: 'Name of the user who sent the message',
    example: 'John Doe',
  })
  userName: string;

  @ApiProperty({
    description: 'UUID of the project this message belongs to',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  projectId: string;

  @ApiProperty({
    description: 'Whether the message has been edited',
    example: false,
  })
  isEdited: boolean;

  @ApiProperty({
    description: 'Whether the message has been deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2026-01-21T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last edit timestamp',
    example: '2026-01-21T11:45:00Z',
    nullable: true,
  })
  editedAt: Date;
}
