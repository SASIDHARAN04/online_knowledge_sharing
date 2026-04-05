require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins their own room to receive private messages
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle incoming messages
  socket.on('sendMessage', async (data) => {
    const { sender, receiver, message } = data;

    // Save message to database
    try {
      const Message = require('./src/models/Message');
      const newMessage = new Message({
        sender,
        receiver,
        message
      });
      await newMessage.save();

      // Emit to receiver's room
      io.to(receiver).emit('receiveMessage', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // WebRTC Signaling
  socket.on('call-user', (data) => {
    console.log(`Calling user ${data.to}`);
    socket.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: socket.id,
      from: data.from
    });
  });

  socket.on('make-answer', (data) => {
    console.log(`Making answer to ${data.to}`);
    socket.to(data.to).emit('answer-made', {
      socket: socket.id,
      answer: data.answer
    });
  });

  socket.on('ice-candidate', (data) => {
    console.log(`Sending ICE candidate to ${data.to}`);
    socket.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
      from: data.from
    });
  });

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('leave-session', (sessionId) => {
    socket.leave(sessionId);
    console.log(`Socket ${socket.id} left session ${sessionId}`);
  });

  socket.on('share-document', (data) => {
    console.log(`Document shared in session ${data.sessionId}`);
    io.to(data.sessionId).emit('receive-resource', data.resource);
  });

  socket.on('document-clicked', (data) => {
    console.log(`Instructing session ${data.sessionId} to open document: ${data.fileUrl}`);
    io.to(data.sessionId).emit('open-document', data);
  });

  socket.on('share-youtube-link', (data) => {
    console.log(`YouTube link shared in session ${data.sessionId}`);
    io.to(data.sessionId).emit('receive-resource', data.resource);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
