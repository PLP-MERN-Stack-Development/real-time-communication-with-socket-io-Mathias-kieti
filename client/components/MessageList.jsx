import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages, markRead }) {
  const endRef = useRef();

  useEffect(() => {
    // scroll to bottom on new messages
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((m) => (
        <div key={m.id || Math.random()} className={`message ${m.system ? 'system' : ''} ${m.isFile ? 'file' : ''}`}>
          {m.system ? (
            <div className="system-text">{m.message}</div>
          ) : (
            <>
              <div className="message-meta">
                <span className="sender">{m.sender}</span>
                <span className="timestamp">{new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>

              {m.isFile ? (
                <div className="file-block">
                  <div className="file-name">{m.file?.filename}</div>
                  {/* Show image preview if image */}
                  {m.file?.dataUrl?.startsWith('data:image') ? (
                    <img src={m.file.dataUrl} alt={m.file.filename} style={{ maxWidth: '250px', borderRadius: 8 }} />
                  ) : (
                    <a href={m.file?.dataUrl} target="_blank" rel="noreferrer">Download</a>
                  )}
                </div>
              ) : (
                <div className="message-text">{m.message}</div>
              )}

              <div className="message-actions">
                <button onClick={() => navigator.clipboard?.writeText(m.message || '')}>Copy</button>
                <button onClick={() => markRead(m.id)}>Mark Read</button>
                <span className="reactions">{Object.keys(m.reactions || {}).length ? '❤️' : ''}</span>
              </div>
            </>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
