import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages, markRead }) {
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-2">
      {messages.map((m) => (
        <div
          key={m.id || Math.random()}
          className={`p-2 rounded-md max-w-full break-words ${
            m.system ? 'bg-gray-700 text-gray-300 text-sm italic' : 'bg-gray-800'
          }`}
        >
          {!m.system && (
            <>
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span className="font-semibold text-teal-400">{m.sender}</span>
                <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              {m.isFile ? (
                m.file?.dataUrl?.startsWith('data:image') ? (
                  <img src={m.file.dataUrl} alt={m.file.filename} className="max-w-xs rounded-md" />
                ) : (
                  <a
                    href={m.file?.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 underline"
                  >
                    {m.file.filename || 'Download'}
                  </a>
                )
              ) : (
                <div>{m.message}</div>
              )}
              <div className="flex gap-2 text-xs mt-1">
                <button onClick={() => navigator.clipboard?.writeText(m.message || '')}>Copy</button>
                <button onClick={() => markRead(m.id)}>Mark Read</button>
              </div>
            </>
          )}
          {m.system && <div>{m.message}</div>}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
