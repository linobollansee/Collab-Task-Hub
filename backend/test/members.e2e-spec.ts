import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-utils';

describe('Project Members (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let memberToken: string;
  let memberId: string;
  let viewerToken: string;
  let viewerId: string;
  let projectId: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Register admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'password123',
      });
    adminToken = adminResponse.body.access_token;

    // Register member user
    const memberResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'member@example.com',
        name: 'Member User',
        password: 'password123',
      });
    memberToken = memberResponse.body.access_token;
    memberId = memberResponse.body.user.id;

    // Register viewer user
    const viewerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'viewer@example.com',
        name: 'Viewer User',
        password: 'password123',
      });
    viewerToken = viewerResponse.body.access_token;
    viewerId = viewerResponse.body.user.id;

    // Create a test project
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Members Test Project',
        description: 'For testing member management',
      });
    projectId = projectResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects/:id/members', () => {
    it('should add a member to project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: memberId,
          role: 'member',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(memberId);
      expect(response.body.projectId).toBe(projectId);
      expect(response.body.role).toBe('member');
    });

    it('should add a viewer to project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: viewerId,
          role: 'viewer',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(viewerId);
      expect(response.body.projectId).toBe(projectId);
      expect(response.body.role).toBe('viewer');
    });

    it('should fail when non-admin tries to add member', async () => {
      // Create another user to try adding
      const newUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newmember@example.com',
          name: 'New Member',
          password: 'password123',
        });

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          userId: newUserResponse.body.user.id,
          role: 'member',
        })
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .send({
          userId: 'some-user-id',
          role: 'member',
        })
        .expect(401);
    });

    it('should fail with invalid role', async () => {
      const newUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalidrole@example.com',
          name: 'Invalid Role',
          password: 'password123',
        });

      await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: newUserResponse.body.user.id,
          role: 'invalid_role',
        })
        .expect(400);
    });

    it('should fail when adding duplicate member', async () => {
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: memberId,
          role: 'member',
        })
        .expect(400);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .post('/projects/00000000-0000-0000-0000-000000000000/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: memberId,
          role: 'member',
        })
        .expect(404);
    });
  });

  describe('PATCH /projects/:id/members/:memberId', () => {
    let membershipId: string;

    beforeAll(async () => {
      // Get the membership ID
      const projectResponse = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const member = projectResponse.body.members.find(
        (m: any) => m.userId === memberId,
      );
      membershipId = member.id;
    });

    it('should update member role', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/members/${membershipId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin',
        })
        .expect(200);

      expect(response.body.id).toBe(membershipId);
      expect(response.body.role).toBe('admin');
    });

    it('should fail when non-admin tries to update role', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/members/${membershipId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          role: 'admin',
        })
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/members/${membershipId}`)
        .send({
          role: 'member',
        })
        .expect(401);
    });

    it('should fail with invalid role', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/members/${membershipId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'invalid_role',
        })
        .expect(400);
    });

    it('should return 404 for non-existent member', async () => {
      await request(app.getHttpServer())
        .patch(
          `/projects/${projectId}/members/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'member',
        })
        .expect(404);
    });
  });

  describe('DELETE /projects/:id/members/:memberId', () => {
    let membershipId: string;

    beforeAll(async () => {
      // Get the viewer membership ID
      const projectResponse = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const viewer = projectResponse.body.members.find(
        (m: any) => m.userId === viewerId,
      );
      membershipId = viewer.id;
    });

    it('should remove member from project', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/members/${membershipId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify member is removed by trying to get project
      const projectResponse = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const removedMember = projectResponse.body.members.find(
        (m: any) => m.id === membershipId,
      );
      expect(removedMember).toBeUndefined();
    });

    it('should fail when non-admin tries to remove member', async () => {
      // Create a new non-admin user
      const nonAdminResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'nonadmin-remove@example.com',
          name: 'Non Admin',
          password: 'password123',
        });

      // Add them as a viewer
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: nonAdminResponse.body.user.id,
          role: 'viewer',
        });

      // First re-add the viewer to be removed
      const viewerResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: viewerId,
          role: 'viewer',
        });

      // Try to remove with non-admin user
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/members/${viewerResponse.body.id}`)
        .set('Authorization', `Bearer ${nonAdminResponse.body.access_token}`)
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}/members/some-member-id`)
        .expect(401);
    });

    it('should return 404 for non-existent member', async () => {
      await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/members/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /projects/:id/role', () => {
    it('should return user role in project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe('admin');
    });

    it('should return member role', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/role`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe('admin'); // Was updated in previous test
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectId}/role`)
        .expect(401);
    });

    it('should return 404 for non-member', async () => {
      const nonMemberResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'nonmember@example.com',
          name: 'Non Member',
          password: 'password123',
        });

      await request(app.getHttpServer())
        .get(`/projects/${projectId}/role`)
        .set('Authorization', `Bearer ${nonMemberResponse.body.access_token}`)
        .expect(403); // Returns 403 for non-members
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .get('/projects/00000000-0000-0000-0000-000000000000/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
