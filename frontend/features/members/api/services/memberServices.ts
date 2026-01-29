import { AxiosInstance } from 'axios';

import type { AddMemberDto, UpdateMemberRoleDto } from '@/features/members/types';
import { api } from '@/shared/api/axios';

class MemberServices {
  private axios: AxiosInstance = api;

  async addMember(projectId: string, dto: AddMemberDto) {
    const res = await this.axios.post(`/projects/${projectId}/members`, dto);
    return res.data;
  }

  async updateRole(projectId: string, memberId: string, dto: UpdateMemberRoleDto) {
    return api.patch(`/projects/${projectId}/members/${memberId}`, dto);
  }

  async deleteMember(projectId: string, memberId: string) {
    return api.delete(`/projects/${projectId}/members/${memberId}`);
  }
}

export const memberServices = new MemberServices();
