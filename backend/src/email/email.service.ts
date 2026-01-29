import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailjet from 'node-mailjet';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private mailjet: Mailjet.Client;
  private senderEmail: string;
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('MAILJET_API_KEY');
    const secretKey = this.configService.get<string>('MAILJET_SECRET_KEY');
    const senderEmail = this.configService.get<string>('MAILJET_SENDER_EMAIL');

    if (!apiKey || !secretKey || !senderEmail) {
      this.logger.warn(
        'Mailjet configuration is missing. Email functionality will be disabled. ' +
          'Set MAILJET_API_KEY, MAILJET_SECRET_KEY, and MAILJET_SENDER_EMAIL to enable emails.',
      );
      this.isConfigured = false;
      return;
    }

    this.senderEmail = senderEmail;
    this.mailjet = new Mailjet({
      apiKey: apiKey,
      apiSecret: secretKey,
    });
    this.isConfigured = true;
    this.logger.log('Email service configured successfully');
  }

  async sendPasswordResetEmail(
    toEmail: string,
    resetToken: string,
    userName: string,
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Cannot send password reset email to ${toEmail}: Email service is not configured`,
      );
      return;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.senderEmail,
              Name: 'Collab Task Hub',
            },
            To: [
              {
                Email: toEmail,
                Name: userName,
              },
            ],
            Subject: 'Password Reset Request',
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hello ${userName},</p>
                <p>We received a request to reset your password for your Collab Task Hub account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="margin: 30px 0;">
                  <a href="${resetLink}" 
                     style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 4px; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${resetLink}">${resetLink}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                  This link will expire in 1 hour.
                </p>
                <p style="color: #666; font-size: 14px;">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">
                  Collab Task Hub - Collaborative Task Management
                </p>
              </div>
            `,
            TextPart: `
              Password Reset Request
              
              Hello ${userName},
              
              We received a request to reset your password for your Collab Task Hub account.
              
              Click the link below to reset your password:
              ${resetLink}
              
              This link will expire in 1 hour.
              
              If you didn't request a password reset, you can safely ignore this email.
              
              Collab Task Hub - Collaborative Task Management
            `,
          },
        ],
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(toEmail: string, userName: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Cannot send welcome email to ${toEmail}: Email service is not configured`,
      );
      return;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    try {
      await this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.senderEmail,
              Name: 'Collab Task Hub',
            },
            To: [
              {
                Email: toEmail,
                Name: userName,
              },
            ],
            Subject: 'Welcome to Collab Task Hub!',
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to Collab Task Hub! 🎉</h2>
                <p>Hello ${userName},</p>
                <p>Thank you for joining Collab Task Hub! We're excited to have you on board.</p>
                <p>Get started by creating your first project and inviting team members to collaborate.</p>
                <div style="margin: 30px 0;">
                  <a href="${frontendUrl}" 
                     style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 4px; display: inline-block;">
                    Get Started
                  </a>
                </div>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">
                  Collab Task Hub - Collaborative Task Management
                </p>
              </div>
            `,
            TextPart: `
              Welcome to Collab Task Hub!
              
              Hello ${userName},
              
              Thank you for joining Collab Task Hub! We're excited to have you on board.
              
              Get started by creating your first project and inviting team members to collaborate.
              
              Visit: ${frontendUrl}
              
              If you have any questions, feel free to reach out to our support team.
              
              Collab Task Hub - Collaborative Task Management
            `,
          },
        ],
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email - it's not critical
    }
  }
}
