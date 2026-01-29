/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';

describe('Projects (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;
  let otherUserToken: string;
  let otherUserId: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Register and login first user
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        name: 'Test User',
        password: 'password123',
      });
    userToken = userResponse.body.access_token;
    userId = userResponse.body.user.id;

    // Register and login second user
    const otherUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'other@example.com',
        name: 'Other User',
        password: 'password123',
      });
    otherUserToken = otherUserResponse.body.access_token;
    otherUserId = otherUserResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects', () => {
    it('should create a new project', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Project',
          description: 'Test Description',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Project');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.createdById).toBe(userId);
      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0].role).toBe('admin');
    });

    it('should fail validation with missing title', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Description only',
        })
        .expect(400);
    });

    it('should fail validation with title exceeding max length', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'a'.repeat(201),
          description: 'Test',
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .send({
          title: 'Unauthorized Project',
          description: 'Should fail',
        })
        .expect(401);
    });

    it('should create project with title only', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Minimal Project',
        })
        .expect(201);

      expect(response.body.title).toBe('Minimal Project');
      expect(response.body.description).toBeNull();
    });
  });

  describe('GET /projects', () => {
    let projectId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User Project',
          description: 'For listing test',
        });
      projectId = response.body.id;
    });

    it('should return all projects for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some((p) => p.id === projectId)).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/projects').expect(401);
    });

    it('should not return projects user is not member of', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.some((p) => p.id === projectId)).toBe(false);
    });
  });

  describe('GET /projects/:id', () => {
    let projectId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Single Project Test',
          description: 'For single fetch test',
        });
      projectId = response.body.id;
    });

    it('should return a single project by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .expect(200);

      expect(response.body.id).toBe(projectId);
      expect(response.body.title).toBe('Single Project Test');
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .get('/projects/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should allow access even when user is not a member', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .expect(200);
    });

    it('should allow access without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .expect(200);
    });
  });

  describe('PATCH /projects/:id', () => {
    let projectId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Update Test Project',
          description: 'Original description',
        });
      projectId = response.body.id;
    });

    it('should update project title', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.description).toBe('Original description');
    });

    it('should update project description', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body.description).toBe('Updated description');
    });

    it('should update both title and description', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Both Updated',
          description: 'Both Updated Desc',
        })
        .expect(200);

      expect(response.body.title).toBe('Both Updated');
      expect(response.body.description).toBe('Both Updated Desc');
    });

    it('should fail when non-admin tries to update', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          title: 'Should Fail',
        })
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .send({
          title: 'Should Fail',
        })
        .expect(401);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .patch('/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Should Fail',
        })
        .expect(404);
    });
  });

  describe('DELETE /projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Delete Test Project',
          description: 'To be deleted',
        });
      projectId = response.body.id;
    });

    it('should delete a project', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .expect(404);
    });

    it('should fail when non-admin tries to delete', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .expect(401);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .delete('/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('Authorization and Ownership', () => {
    it('should prevent users from updating projects they do not own', async () => {
      const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Owner Test Project',
          description: 'Owner only',
        });

      await request(app.getHttpServer())
        .patch(`/projects/${projectResponse.body.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          title: 'Hacked Title',
        })
        .expect(403);
    });

    it('should prevent users from deleting projects they do not own', async () => {
      const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Delete Owner Test',
          description: 'Owner only',
        });

      await request(app.getHttpServer())
        .delete(`/projects/${projectResponse.body.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });
  });
});
