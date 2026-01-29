'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useStoreAuth } from '@/features/auth/store/use-store-auth';
import ConfirmDeleteModal from '@/features/modal/components/ConfirmDeleteModal';
import { useModal } from '@/features/modal/hooks/useModal';
import { useProjects } from '@/features/project/hooks/useProject';
import { Button, Loader } from '@/shared/ui';

import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { useStoreChat } from '../store/use-store-chat';
import { ChatInput } from './ChatInput';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

const Chat: React.FC = () => {
  const { user } = useStoreAuth();
  const { selectedProject } = useProjects();
  const { openModal } = useModal();
  const projectId = selectedProject?.id || null;

  console.log('[CHAT] Component rendered', {
    projectId,
    selectedProject: selectedProject?.title,
  });

  const {
    messages,
    isLoading,
    error,
    typingUsers,
    loadMessages,
    clearMessages,
    editMessage,
    deleteMessage,
  } = useStoreChat();

  const { isConnected, sendMessage, setTyping } = useChatWebSocket(projectId);

  console.log('[CHAT] WebSocket status', { isConnected, projectId });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  useEffect(() => {
    console.log('[CHAT] Load messages effect', { projectId, hasLoadedInitial });

    if (projectId && !hasLoadedInitial) {
      loadMessages(projectId)
        .then(() => {
          console.log('[CHAT] Messages loaded successfully');
          setHasLoadedInitial(true);
        })
        .catch((error) => {
          console.error('[CHAT] Failed to load messages:', error);
        });
    }

    return () => {
      clearMessages();
      setHasLoadedInitial(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, loadMessages, clearMessages]);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isAtBottom);
    }
  };

  const handleSendMessage = (content: string) => {
    if (isConnected && projectId) {
      sendMessage(content, projectId);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editMessage(messageId, content);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    openModal(
      <ConfirmDeleteModal entityName="message" onConfirm={() => deleteMessage(messageId)} />,
    );
  };

  const handleTyping = (isTyping: boolean) => {
    if (projectId) {
      setTyping(projectId, isTyping);
    }
  };

  const loadOlderMessages = async () => {
    if (messages.length > 0 && projectId) {
      const oldestMessage = messages[0];
      try {
        await loadMessages(projectId, 50, oldestMessage.createdAt);
      } catch (error) {
        console.error('Failed to load older messages:', error);
      }
    }
  };

  const isProjectMember =
    selectedProject?.members.some((member) => member.userId === user?.id) ||
    selectedProject?.createdById === user?.id;

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please log in to access chat</p>
      </div>
    );
  }

  if (selectedProject && !isProjectMember) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 max-w-md">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                You are not a member of this project
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Project Chat</h2>
          <p className="text-xs text-gray-500">
            {isConnected ? (
              <span className="text-green-600">● Connected</span>
            ) : (
              <span className="text-red-600">● Disconnected</span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {messages.length >= 50 && (
          <div className="text-center mb-4">
            <Button
              onClick={loadOlderMessages}
              disabled={isLoading}
              variant="secondary"
              className="text-sm underline"
            >
              Load older messages
            </Button>
          </div>
        )}

        {isLoading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm">Be the first to send a message!</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
        ))}

        <TypingIndicator typingUsers={typingUsers} currentUserId={user.id} />

        <div ref={messagesEndRef} />
      </div>

      {!autoScroll && (
        <Button
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setAutoScroll(true);
          }}
          variant="primary"
          className="absolute bottom-24 right-8 rounded-full p-3 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </Button>
      )}

      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={!isConnected || !isProjectMember}
      />
    </div>
  );
};

export default Chat;
