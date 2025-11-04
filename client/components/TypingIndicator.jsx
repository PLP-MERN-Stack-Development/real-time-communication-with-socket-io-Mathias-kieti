import React from 'react';

export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return null;
  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : `${typingUsers.join(', ')} are typing...`;
  return <div className="text-gray-400 text-sm mt-1">{text}</div>;
}
