import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { env } from '@/shared/config/env';

import { useStoreChat } from '../store/use-store-chat';
import { ChatMessage, UseChatWebSocketReturn } from '../types';

const WS_URL = `${env.wsUrl}/chat`;

export const useChatWebSocket = (projectId: string | null): UseChatWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { addMessage, updateMessage, setTypingUser, removeTypingUser } = useStoreChat();

  useEffect(() => {
    if (!projectId) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Initialize socket connection
    const socket = io(WS_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
      setIsConnected(true);

      // Auto-join project room on connect
      socket.emit('join-project', { projectId });
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Listen for new messages
    socket.on('new-message', (message: ChatMessage) => {
      console.log('New message received:', message);
      addMessage(message);
    });

    // Listen for edited messages
    socket.on('message-edited', (message: ChatMessage) => {
      console.log('Message edited:', message);
      updateMessage(message);
    });

    // Listen for deleted messages
    socket.on('message-deleted', (message: ChatMessage) => {
      console.log('Message deleted:', message);
      updateMessage(message);
    });

    // Listen for typing indicators
    socket.on('user-typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUser(data.userId, data.userName);
      } else {
        removeTypingUser(data.userId);
      }
    });

    socket.on('joined-project', (data) => {
      console.log('Joined project:', data);
    });

    socket.on('message-sent', (data) => {
      console.log('Message sent acknowledgment:', data);
    });

    return () => {
      if (socket) {
        socket.emit('leave-project', { projectId });
        socket.disconnect();
      }
    };
  }, [projectId, addMessage, updateMessage, setTypingUser, removeTypingUser]);

  const sendMessage = (content: string, projectId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', { content, projectId });
    }
  };

  const editMessage = (messageId: string, content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('edit-message', { messageId, content });
    }
  };

  const setTyping = (projectId: string, isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { projectId, isTyping });
    }
  };

  const joinProject = (projectId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-project', { projectId });
    }
  };

  const leaveProject = (projectId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-project', { projectId });
    }
  };

  return {
    isConnected,
    sendMessage,
    editMessage,
    setTyping,
    joinProject,
    leaveProject,
  };
};
