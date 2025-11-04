import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages, markRead }) {
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-800">
      {messages.map((m) => (
        <div
          key={m.id || Math.random()}
          className={`p-2 rounded max-w-[70%] ${
            m.system
              ? 'bg-gray-600 text-gray-300 self-center'
              : m.isFile
              ? 'bg-gray-700'
              : 'bg-gray-700 text-white'
          }`}
        >
          {m.system ? (
            <div>{m.message}</div>
          ) : (
            <>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="font-semibold">{m.sender}</span>
                <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>

              {m.isFile ? (
                <div>
                  <div>{m.file?.filename}</div>
                  {m.file?.dataUrl?.startsWith('data:image') ? (
                    <img
                      src={m.file.dataUrl}
                      alt={m.file.filename}
                      className="max-w-xs rounded mt-1"
                    />
                  ) : (
                    <a href={m.file?.dataUrl} target="_blank" rel="noreferrer" className="text-teal-400">
                      Download
                    </a>
                  )}
                </div>
              ) : (
                <div>{m.message}</div>
              )}

              <div className="flex gap-2 text-xs mt-1">
                <button
                  className="hover:underline"
                  onClick={() => navigator.clipboard?.writeText(m.message || '')}
                >
                  Copy
                </button>
                <button className="hover:underline" onClick={() => markRead(m.id)}>
                  Mark Read
                </button>
              </div>
            </>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
