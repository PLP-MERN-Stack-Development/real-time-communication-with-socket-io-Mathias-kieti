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
    <div className="p-4 border-t border-gray-700 flex gap-2 items-end bg-gray-900">
      <textarea
        className="flex-1 p-2 rounded bg-gray-800 text-white resize-none focus:outline-none"
        placeholder={`Message #${room}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        rows={2}
      />
      <input type="file" ref={fileRef} onChange={onFileChange} className="text-sm" />
      <button
        className="bg-teal-400 hover:bg-teal-500 text-gray-900 font-bold px-4 py-2 rounded"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}
