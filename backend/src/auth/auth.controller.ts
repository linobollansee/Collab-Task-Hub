import {
  Body,
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns authenticated user data without password',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user data retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: '2026-01-12T10:30:00Z',
        updatedAt: '2026-01-12T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  getMe(@CurrentUser() user: User) {
    // Return user without password using Omit type
    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash; // Mark as intentionally unused
    return userWithoutPassword;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset link to email if account exists',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if account exists',
    schema: {
      example: {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password using token from email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
    schema: {
      example: {
        message: 'Password has been reset successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
