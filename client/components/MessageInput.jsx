import React, { useRef, useState } from 'react';

export default function MessageInput({ room, onSend, onTyping, onSendFile }) {
  const [text, setText] = useState('');
  const fileRef = useRef();

  const handleSend = () => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    onTyping(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      onTyping(true);
      clearTimeout(window._typingTimer);
      window._typingTimer = setTimeout(() => onTyping(false), 800);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSendFile(reader.result, file.name);
    reader.readAsDataURL(file);
    fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <textarea
        className="flex-1 p-2 rounded-md bg-gray-800 text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
        placeholder={`Message #${room}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
      />
      <div className="flex gap-2 items-center">
        <input type="file" ref={fileRef} onChange={onFileChange} className="text-sm text-gray-400" />
        <button
          onClick={handleSend}
          className="py-2 px-4 bg-teal-500 hover:bg-teal-600 rounded-md font-semibold text-gray-900"
        >
          Send
        </button>
      </div>
    </div>
  );
}
