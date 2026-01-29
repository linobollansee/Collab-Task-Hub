import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Register and login user
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'userstest@example.com',
        name: 'Users Test',
        password: 'password123',
      });
    userToken = userResponse.body.access_token;
    userId = userResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should get all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      response.body.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).not.toHaveProperty('passwordHash');
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('GET /users/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        email: 'userstest@example.com',
        name: 'Users Test',
      });
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update user name', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.email).toBe('userstest@example.com');
    });

    it('should update user email', async () => {
      const newEmail = `updated${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: newEmail,
        })
        .expect(200);

      expect(response.body.email).toBe(newEmail);
    });

    it('should update user password', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'newpassword123',
        })
        .expect(200);

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');

      // Verify new password works
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: response.body.email,
          password: 'newpassword123',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
    });

    it('should update multiple fields', async () => {
      const newEmail = `multi${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Multi Update',
          email: newEmail,
        })
        .expect(200);

      expect(response.body.name).toBe('Multi Update');
      expect(response.body.email).toBe(newEmail);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .send({
          name: 'Should Fail',
        })
        .expect(401);
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with password less than 6 characters', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: '12345',
        })
        .expect(400);
    });

    it('should not allow updating with duplicate email', async () => {
      // Create another user
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'duplicate-check@example.com',
        name: 'Duplicate Check',
        password: 'password123',
      });

      // Try to update current user with existing email
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'duplicate-check@example.com',
        })
        .expect(409);
    });
  });
});
