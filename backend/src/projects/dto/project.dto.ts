import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '../project.entity';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Build a Rocket to Mars',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example:
      'Design and launch a sustainable rocket for Mars colonization. Includes snacks for the crew.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProjectDto {
  @ApiProperty({
    example: 'Build TWO Rockets to Mars',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    example:
      'Expanded mission: Now building two rockets because one is never enough. Still includes snacks.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AddMemberDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'member',
    enum: ProjectRole,
  })
  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({
    example: 'admin',
    enum: ProjectRole,
  })
  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}
