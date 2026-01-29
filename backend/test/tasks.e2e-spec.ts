/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;
  let _otherUserToken: string;
  let otherUserId: string;
  let projectId: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Register first user
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'taskuser@example.com',
        name: 'Task User',
        password: 'password123',
      });
    userToken = userResponse.body.access_token;
    userId = userResponse.body.user.id;

    // Register second user
    const otherUserResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'othertask@example.com',
        name: 'Other Task User',
        password: 'password123',
      });
    _otherUserToken = otherUserResponse.body.access_token;
    otherUserId = otherUserResponse.body.user.id;

    // Create a test project
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task Test Project',
        description: 'For testing tasks',
      });
    projectId = projectResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Task',
          description: 'Task description',
          projectId: projectId,
          status: 'backlog',
          priority: 'medium',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Test Task',
        description: 'Task description',
        status: 'backlog',
        priority: 'medium',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a task with assignee', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Assigned Task',
          description: 'Task with assignee',
          projectId: projectId,
          assigneeId: userId,
          status: 'in_progress',
          priority: 'high',
        })
        .expect(201);

      expect(response.body.assigneeId).toBe(userId);
      expect(response.body.status).toBe('in_progress');
      expect(response.body.priority).toBe('high');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'No Auth Task',
          projectId: projectId,
        })
        .expect(401);
    });

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Missing title',
          projectId: projectId,
        })
        .expect(400);
    });

    it('should fail with invalid status', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Invalid Status Task',
          projectId: projectId,
          status: 'invalid_status',
        })
        .expect(400);
    });

    it('should fail with invalid priority', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Invalid Priority Task',
          projectId: projectId,
          priority: 'invalid_priority',
        })
        .expect(400);
    });
  });

  describe('GET /tasks', () => {
    let _task1Id: string;
    let _task2Id: string;

    beforeAll(async () => {
      const response1 = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task 1',
          description: 'First task',
          projectId: projectId,
          status: 'backlog',
          priority: 'low',
        });
      _task1Id = response1.body.id;

      const response2 = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Task 2',
          description: 'Second task',
          projectId: projectId,
          status: 'in_progress',
          priority: 'high',
        });
      _task2Id = response2.body.id;
    });

    it('should get all tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter tasks by projectId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tasks?projectId=${projectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((task: any) => {
        expect(task.projectId).toBe(projectId);
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/tasks').expect(401);
    });
  });

  describe('GET /tasks/:id', () => {
    let taskId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Get Task Test',
          description: 'Task to retrieve',
          projectId: projectId,
          status: 'review',
          priority: 'medium',
        });
      taskId = response.body.id;
    });

    it('should get a specific task', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Get Task Test');
      expect(response.body.status).toBe('review');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(401);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .get('/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Update Task Test',
          description: 'Original description',
          projectId: projectId,
          status: 'backlog',
          priority: 'low',
        });
      taskId = response.body.id;
    });

    it('should update task title', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Task Title',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Task Title');
      expect(response.body.description).toBe('Original description');
    });

    it('should update task status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'done',
        })
        .expect(200);

      expect(response.body.status).toBe('done');
    });

    it('should update task priority', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          priority: 'high',
        })
        .expect(200);

      expect(response.body.priority).toBe('high');
    });

    it('should update task assignee', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          assigneeId: otherUserId,
        })
        .expect(200);

      expect(response.body.assigneeId).toBe(otherUserId);
    });

    it('should update multiple fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Fully Updated',
          description: 'Updated description',
          status: 'in_progress',
          priority: 'high',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        title: 'Fully Updated',
        description: 'Updated description',
        status: 'in_progress',
        priority: 'high',
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .send({
          title: 'Should Fail',
        })
        .expect(401);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .patch('/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Should Fail',
        })
        .expect(404);
    });

    it('should fail with invalid status', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'invalid_status',
        })
        .expect(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Delete Task Test',
          description: 'To be deleted',
          projectId: projectId,
        });
      taskId = response.body.id;
    });

    it('should delete a task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(401);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});
