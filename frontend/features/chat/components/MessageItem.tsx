import React, { useState } from 'react';

import { useStoreAuth } from '@/features/auth/store/use-store-auth';
import { Button } from '@/shared/ui';

import { ChatMessage as ChatMessageType } from '../types';

interface MessageItemProps {
  message: ChatMessageType;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onEdit, onDelete }) => {
  const { user } = useStoreAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const isOwnMessage = user?.id === message.userId;
  const isDeleted = message.isDeleted;

  const handleStartEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {!isOwnMessage && (
          <div className="text-xs font-medium text-gray-600 mb-1 px-2">{message.userName}</div>
        )}

        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          } ${isDeleted ? 'opacity-50 italic' : ''}`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded text-gray-900 min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} variant="primary" className="text-xs py-1 px-3">
                  Save
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="secondary"
                  className="text-xs py-1 px-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          )}

          <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
            {message.isEdited && !isDeleted && ' (edited)'}
          </div>
        </div>

        {isOwnMessage && !isDeleted && !isEditing && (
          <div className="flex gap-2 mt-1 justify-end px-2">
            <Button onClick={handleStartEdit} variant="secondary" className="text-xs py-1 px-3">
              Edit
            </Button>
            <Button
              onClick={() => onDelete(message.id)}
              variant="secondary"
              className="text-xs py-1 px-3 text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
