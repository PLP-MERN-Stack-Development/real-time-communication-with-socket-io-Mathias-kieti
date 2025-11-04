import React from 'react';

export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return null;
  const text = typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.join(', ')} are typing...`;
  return <div className="typing-indicator">{text}</div>;
}
