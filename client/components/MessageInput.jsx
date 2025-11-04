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
      // debounce typing off
      clearTimeout(window._typingTimer);
      window._typingTimer = setTimeout(() => onTyping(false), 800);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      onSendFile(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
    // reset
    fileRef.current.value = '';
  };

  return (
    <div className="message-input">
      <textarea
        placeholder={`Message #${room}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
      />
      <div className="controls">
        <input ref={fileRef} type="file" onChange={onFileChange} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
