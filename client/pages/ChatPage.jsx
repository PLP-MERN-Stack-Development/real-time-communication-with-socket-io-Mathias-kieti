import React, { useEffect, useState } from 'react';
import { useSocket } from '../src/socket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import UserList from '../components/UserList';

export default function ChatPage({ username, onLogout, backendUrl }) {
  const {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    setTyping,
    sendPrivateMessage,
    joinRoom,
    markMessageRead,
  } = useSocket(backendUrl);

  const [room, setRoom] = useState('global');

  useEffect(() => {
    connect(username);
    socket?.emit('join_room', room);
    return () => disconnect();
  }, []); // eslint-disable-line

  useEffect(() => {
    joinRoom(room);
  }, [room]); // eslint-disable-line

  const handleLogout = () => {
    disconnect();
    onLogout();
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <aside className="w-64 flex-shrink-0 bg-gray-900 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-4">Socket Chat</h3>
          <div className="mb-4">
            <strong>{username}</strong>
            <div className={`text-sm mt-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>

          <UserList
            users={users}
            onPrivate={(id) => {
              const msg = prompt('Type private message:');
              if (msg) sendPrivateMessage(id, msg, (ack) => console.log('private ack', ack));
            }}
          />
        </div>

        <div className="space-y-2">
          <button
            className="w-full py-2 px-4 bg-teal-500 rounded hover:bg-teal-600"
            onClick={() => setRoom('global')}
          >
            Global
          </button>
          <button
            className="w-full py-2 px-4 bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => setRoom('room-1')}
          >
            Room 1
          </button>
          <button
            className="w-full py-2 px-4 bg-indigo-500 rounded hover:bg-indigo-600"
            onClick={() => setRoom('room-2')}
          >
            Room 2
          </button>
          <button
            className="w-full py-2 px-4 bg-red-500 rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h4 className="text-lg font-semibold">{room === 'global' ? 'Global Chat' : room}</h4>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <MessageList
            messages={messages.filter((m) => (m.room || 'global') === room)}
            markRead={(messageId) => markMessageRead(messageId, room)}
          />
          <TypingIndicator typingUsers={typingUsers} />
        </div>

        <div className="p-4 border-t border-gray-700">
          <MessageInput
            room={room}
            onSend={(msg) => sendMessage(msg, room, (ack) => console.log('sent ack', ack))}
            onTyping={(isTyping) => setTyping(isTyping, room)}
            onSendFile={(dataUrl, filename) =>
              socket?.emit('file_message', { dataUrl, filename, room }, (ack) =>
                console.log('file ack', ack)
              )
            }
          />
        </div>
      </main>
    </div>
  );
}
