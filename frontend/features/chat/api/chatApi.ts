import { api } from '@/shared/api/axios';

import { ChatMessage } from '../types';

export const chatApi = {
  async getMessages(
    projectId: string,
    limit: number = 200,
    before?: string,
  ): Promise<ChatMessage[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) {
      params.append('before', before);
    }
    const response = await api.get(`/chat/projects/${projectId}/messages?${params}`);
    return response.data;
  },

  async editMessage(messageId: string, content: string): Promise<ChatMessage> {
    const response = await api.patch(`/chat/messages/${messageId}`, { content });
    return response.data;
  },

  async deleteMessage(messageId: string): Promise<ChatMessage> {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  },
};
