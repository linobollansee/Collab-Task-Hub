import React from 'react';

interface TypingIndicatorProps {
  typingUsers: Map<string, string>;
  currentUserId?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, currentUserId }) => {
  // Filter out current user
  const otherTypingUsers = Array.from(typingUsers.entries()).filter(
    ([userId]) => userId !== currentUserId,
  );

  if (otherTypingUsers.length === 0) return null;

  const names = otherTypingUsers.map(([, userName]) => userName);

  let displayText;
  if (names.length === 1) {
    displayText = `${names[0]} is typing`;
  } else if (names.length === 2) {
    displayText = `${names[0]} and ${names[1]} are typing`;
  } else {
    displayText = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      {displayText}
      <span className="inline-flex ml-1">
        <span className="animate-bounce animation-delay-0">.</span>
        <span className="animate-bounce animation-delay-100">.</span>
        <span className="animate-bounce animation-delay-200">.</span>
      </span>
    </div>
  );
};
