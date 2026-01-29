import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users
   * GET /users
   */
  @Get()
  @ApiOperation({
    summary: 'Get all users or search users',
    description:
      'Retrieve a list of all registered users or search by name/email',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter users by name or email',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all users or filtered users',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllUsers(@Query('search') search?: string) {
    const users = search
      ? await this.usersService.searchUsers(search)
      : await this.usersService.getAllUsers();
    return users.map((user) => {
      const { passwordHash, ...result } = user;
      void passwordHash;
      return result;
    });
  }

  /**
   * Get current user profile
   * GET /users/me
   */
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: User) {
    const { passwordHash, ...result } = user;
    void passwordHash;
    return result;
  }

  /**
   * Update current user profile
   * PATCH /users/me
   */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Update the authenticated user profile. Supports partial updates of name, email, and password.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateProfile(userId, updateUserDto);
    const { passwordHash, ...result } = user;
    void passwordHash;
    return result;
  }
}
