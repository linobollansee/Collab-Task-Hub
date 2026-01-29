export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  projectId: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  editedAt: string | null;
}

export interface SendMessageDto {
  content: string;
  projectId: string;
}

export interface EditMessageDto {
  content: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  typingUsers: Map<string, string>; // userId -> userName

  // Actions
  clearError: () => void;
  loadMessages: (projectId: string, limit?: number, before?: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (message: ChatMessage) => void;
  removeMessage: (messageId: string) => void;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  setTypingUser: (userId: string, userName: string) => void;
  removeTypingUser: (userId: string) => void;
  clearMessages: () => void;
}

export interface UseChatWebSocketReturn {
  isConnected: boolean;
  sendMessage: (content: string, projectId: string) => void;
  editMessage: (messageId: string, content: string) => void;
  setTyping: (projectId: string, isTyping: boolean) => void;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}
