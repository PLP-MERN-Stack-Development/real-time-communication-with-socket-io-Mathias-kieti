// server.js (enhanced)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const routes = require('./routes');


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // optional: increase payload for file/base64 messages (careful in prod)
  maxHttpBufferSize: 1e7, // ~10MB
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // for file upload via API
app.use(express.static(path.join(__dirname, 'public')));

// In-memory stores (demo). Replace with a database for persistence.
const users = {};             // socketId -> { username, id, currentRoom }
const messages = {            // room -> [message]
  global: [],
};
const typingUsers = {};       // room -> { socketId: username }

// Helper to push message to room store & enforce length cap
function storeMessage(room, message) {
  if (!messages[room]) messages[room] = [];
  messages[room].push(message);
  const MAX = 500; // increase if you want; DB recommended
  if (messages[room].length > MAX) messages[room].shift();
}

io.on('connection', (socket) => {
  console.log(`Connected ${socket.id}`);

  // If using token-based auth:
  // const token = socket.handshake.auth?.token

  // Join default room
  socket.join('global');
  users[socket.id] = { id: socket.id, username: 'Anonymous', currentRoom: 'global' };
  io.to('global').emit('user_list', Object.values(users).map(u => ({ username: u.username, id: u.id })));

  // USER JOIN (username-based)
  socket.on('user_join', (username, cb) => {
    users[socket.id].username = username || 'Anonymous';
    io.emit('user_joined', { username, id: socket.id });
    io.emit('user_list', Object.values(users).map(u => ({ username: u.username, id: u.id })));
    if (cb) cb({ ok: true });
  });

  // JOIN ROOM
  socket.on('join_room', (room, cb) => {
    const prevRoom = users[socket.id].currentRoom;
    if (prevRoom) socket.leave(prevRoom);
    socket.join(room);
    users[socket.id].currentRoom = room;
    io.to(room).emit('user_list', Object.values(users).filter(u => u.currentRoom === room));
    if (cb) cb({ ok: true });
  });

  // SEND MESSAGE with acknowledgement callback
  socket.on('send_message', (messageData, ack) => {
    // messageData should include: { message, room }
    const room = messageData.room || users[socket.id].currentRoom || 'global';
    const message = {
      id: Date.now().toString() + '-' + Math.random().toString(36).slice(2,8),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message: messageData.message,
      room,
      timestamp: new Date().toISOString(),
      status: 'delivered', // initial state
      reactions: {}, // reactionType -> [userId]
    };
    storeMessage(room, message);

    // broadcast
    io.to(room).emit('receive_message', message);

    // ack back to sender (message id, timestamp)
    if (typeof ack === 'function') {
      ack({ status: 'ok', id: message.id, timestamp: message.timestamp });
    }
  });

  // PRIVATE MESSAGE
  socket.on('private_message', ({ toSocketId, message }, ack) => {
    const messageData = {
      id: Date.now().toString(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    socket.to(toSocketId).emit('private_message', messageData);
    socket.emit('private_message', messageData); // echo for sender
    if (ack) ack({ ok: true, id: messageData.id });
  });

  // MESSAGE READ (read receipts)
  socket.on('message_read', ({ messageId, room }) => {
    // Optionally update DB / in-memory record
    io.to(room).emit('message_read', { messageId, readerId: socket.id, timestamp: new Date().toISOString() });
  });

  // MESSAGE REACTION
  socket.on('message_reaction', ({ messageId, room, reaction }, ack) => {
    // Update in-memory (search message)
    const roomMsgs = messages[room] || [];
    const msg = roomMsgs.find(m => m.id === messageId);
    if (msg) {
      msg.reactions = msg.reactions || {};
      msg.reactions[reaction] = msg.reactions[reaction] || [];
      // toggle by user
      const idx = msg.reactions[reaction].indexOf(socket.id);
      if (idx === -1) msg.reactions[reaction].push(socket.id);
      else msg.reactions[reaction].splice(idx, 1);
      io.to(room).emit('message_reaction', { messageId, reaction, reactors: msg.reactions[reaction] });
      if (ack) ack({ ok: true });
    } else {
      if (ack) ack({ ok: false, error: 'not_found' });
    }
  });

  // TYPING
  socket.on('typing', ({ isTyping, room }) => {
    const r = room || users[socket.id].currentRoom || 'global';
    typingUsers[r] = typingUsers[r] || {};
    if (isTyping) typingUsers[r][socket.id] = users[socket.id].username;
    else delete typingUsers[r][socket.id];
    io.to(r).emit('typing_users', Object.values(typingUsers[r] || {}));
  });

  // FILE/IMAGE (base64) - demo only; production: use direct upload + URL
  socket.on('file_message', ({ dataUrl, filename, room }, ack) => {
    const roomName = room || users[socket.id].currentRoom || 'global';
    const message = {
      id: Date.now().toString(),
      sender: users[socket.id]?.username,
      senderId: socket.id,
      file: { dataUrl, filename },
      room: roomName,
      timestamp: new Date().toISOString(),
      isFile: true,
    };
    storeMessage(roomName, message);
    io.to(roomName).emit('receive_message', message);
    if (ack) ack({ ok: true, id: message.id });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Disconnect', socket.id);
    const user = users[socket.id];
    if (user) {
      io.emit('user_left', { username: user.username, id: socket.id });
      // cleanup
      delete users[socket.id];
    }
    // cleanup typing
    Object.keys(typingUsers).forEach(room => {
      if (typingUsers[room]) delete typingUsers[room][socket.id];
      io.to(room).emit('typing_users', Object.values(typingUsers[room] || {}));
    });
    io.emit('user_list', Object.values(users));
  });
});

// API: paginate messages by room

app.use('/api', routes); 

app.get('/api/messages', (req, res) => {
  const room = req.query.room || 'global';
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const roomMsgs = messages[room] || [];
  // newest first
  const start = Math.max(0, roomMsgs.length - page * limit);
  const end = roomMsgs.length - (page - 1) * limit;
  const pageMsgs = roomMsgs.slice(start, end);
  res.json({ room, page, limit, items: pageMsgs });
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

app.get('/', (req, res) => res.send('Socket.io Chat Server is running'));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));

module.exports = { app, server, io };
