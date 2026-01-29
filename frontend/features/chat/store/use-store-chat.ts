import { create } from 'zustand';

import { chatApi } from '../api/chatApi';
import { ChatMessage, ChatStore } from '../types';

export const useStoreChat = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  typingUsers: new Map(),

  clearError: () => set({ error: null }),

  loadMessages: async (projectId: string, limit = 200, before?: string) => {
    set({ isLoading: true, error: null });

    try {
      const messages = await chatApi.getMessages(projectId, limit, before);

      if (before) {
        set({ messages: [...messages, ...get().messages] });
      } else {
        set({ messages });
      }
    } catch (e: unknown) {
      const error = e as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        config?: { url?: string };
      };

      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to load messages';

      const isNotMemberError = errorMessage === 'You are not a member of this project';

      if (!isNotMemberError) {
        console.error('[Chat] Failed to load messages:', {
          status: error?.response?.status,
          message: errorMessage,
          url: error?.config?.url,
          projectId,
        });
        set({ error: errorMessage });
      }

      if (!isNotMemberError) {
        throw e;
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addMessage: (message: ChatMessage) => {
    const messages = get().messages;
    if (!messages.find((m) => m.id === message.id)) {
      set({ messages: [...messages, message] });
    }
  },

  updateMessage: (message: ChatMessage) => {
    set({
      messages: get().messages.map((m) => (m.id === message.id ? message : m)),
    });
  },

  removeMessage: (messageId: string) => {
    set({
      messages: get().messages.filter((m) => m.id !== messageId),
    });
  },

  editMessage: async (messageId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMessage = await chatApi.editMessage(messageId, content);
      get().updateMessage(updatedMessage);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to edit message',
      });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMessage: async (messageId: string) => {
    set({ isLoading: true, error: null });
    try {
      const deletedMessage = await chatApi.deleteMessage(messageId);
      get().updateMessage(deletedMessage);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to delete message',
      });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  setTypingUser: (userId: string, userName: string) => {
    const typingUsers = new Map(get().typingUsers);
    typingUsers.set(userId, userName);
    set({ typingUsers });
  },

  removeTypingUser: (userId: string) => {
    const typingUsers = new Map(get().typingUsers);
    typingUsers.delete(userId);
    set({ typingUsers });
  },

  clearMessages: () => {
    set({ messages: [], typingUsers: new Map() });
  },
}));
