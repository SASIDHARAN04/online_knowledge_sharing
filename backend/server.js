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

  // User joins their own room to receive private messages (e.g. notifications)
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    } else {
      console.log('Socket joined without valid userId');
    }
  });

  // Handle incoming messages
  socket.on('sendMessage', async (data) => {
    const { sender, receiver, message } = data;

    // Save message to database
    try {
      const Message = require('./src/models/Message');
      const User = require('./src/models/User');
      const newMessage = new Message({
        sender,
        receiver,
        message
      });
      await newMessage.save();

      // Save notification for the Bell
      const senderUser = await User.findById(sender);
      const Notification = require('./src/models/Notification');
      const newNotification = new Notification({
        recipient: receiver,
        sender: sender,
        type: 'message',
        message: `New message from ${senderUser?.name || 'Someone'}`,
      });
      await newNotification.save();
      
      const populatedNotification = await Notification.findById(newNotification._id).populate('sender', 'name avatar');

      // Emit to receiver's room
      io.to(receiver).emit('receiveMessage', newMessage);
      io.to(receiver).emit('new-notification', populatedNotification);
    } catch (error) {
      console.error('Error saving message and notification:', error);
    }
  });

  // WebRTC Signaling
  socket.on('call-user', (data) => {
    console.log(`Sending offer from ${socket.id} to ${data.to}`);
    socket.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: socket.id
    });
  });

  socket.on('make-answer', (data) => {
    console.log(`Sending answer from ${socket.id} to ${data.to}`);
    socket.to(data.to).emit('answer-made', {
      socket: socket.id,
      answer: data.answer
    });
  });

  socket.on('ice-candidate', (data) => {
    console.log(`Sending ICE candidate from ${socket.id} to ${data.to}`);
    socket.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Call Invitation Signaling
  socket.on('request-call', async (data) => {
    console.log(`Call requested from ${data.from.name} to ${data.to}`);
    
    try {
      const Notification = require('./src/models/Notification');
      const newNotification = new Notification({
        recipient: data.to,
        sender: data.from.id,
        type: 'call',
        message: `${data.from.name} is calling you`,
        sessionId: data.sessionId
      });
      await newNotification.save();
      
      const populatedNotification = await Notification.findById(newNotification._id).populate('sender', 'name avatar');

      // Relay to recipient's room
      socket.to(data.to).emit('incoming-call', {
        from: data.from,
        sessionId: data.sessionId
      });

      // Also emit a general notification for the Bell dropdown
      socket.to(data.to).emit('new-notification', populatedNotification);
    } catch (error) {
      console.error('Error saving call notification:', error);
    }
  });

  socket.on('accept-call', (data) => {
    console.log(`Call accepted by ${socket.id}, notifying ${data.to}`);
    socket.to(data.to).emit('call-accepted', {
      sessionId: data.sessionId
    });
  });

  socket.on('decline-call', (data) => {
    console.log(`Call declined by ${socket.id}, notifying ${data.to}`);
    socket.to(data.to).emit('call-rejected');
  });

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
    
    // Notify others in the room that a new user has joined
    socket.to(sessionId).emit('user-joined', {
      socket: socket.id
    });
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
