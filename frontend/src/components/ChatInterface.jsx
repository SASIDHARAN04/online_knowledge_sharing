import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getMessages } from '../services/chatService';
import { getMyRequests } from '../services/requestService';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, User, MessageSquare, Video, MoreVertical, Phone, Circle, Hash, ArrowLeft, Sparkles } from 'lucide-react';

const ChatInterface = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    if (user?.id) {
      newSocket.emit('join', user.id);
    }

    newSocket.on('receiveMessage', (message) => {
      if (selectedContact?.id === message.sender || selectedContact?.id === message.receiver) {
         setMessages((prev) => [...prev, message]);
      }
      fetchContacts();
    });

    fetchContacts();

    return () => newSocket.close();
  }, [user, selectedContact?.id]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const data = await getMyRequests();
      const acceptedRequests = [...data.incoming, ...data.outgoing].filter(r => r.status === 'Accepted');
      const uniqueContacts = [];
      const seen = new Set();

      acceptedRequests.forEach(req => {
        const otherUser = req.sender._id === user.id ? req.receiver : req.sender;
        if (!seen.has(otherUser._id)) {
          seen.add(otherUser._id);
          uniqueContacts.push({
            id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar,
            skill: req.skillExchange || 'Web Development', // Using skillExchange field
            status: Math.random() > 0.3 ? 'online' : 'offline' // Mock status
          });
        }
      });
      setContacts(uniqueContacts);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const msgs = await getMessages(contactId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || !socket) return;

    const messageData = {
      sender: user.id,
      receiver: selectedContact.id,
      message: newMessage,
      timestamp: new Date()
    };

    socket.emit('sendMessage', messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-180px)] overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">
      
      {/* Search & Contacts Sidebar */}
      <div className={`w-full lg:w-[400px] flex flex-col border-r border-slate-50 bg-[#FBFBFE] z-20 ${selectedContact ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Messaging</h3>
            <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
               <MessageSquare size={18} />
            </div>
          </div>
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
             <Input 
               className="pl-12 h-14 bg-white border-2 border-slate-50 focus-visible:bg-white focus-visible:border-primary/20 rounded-2xl shadow-sm focus-visible:ring-0" 
               placeholder="Search by name or skill..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recent Conversations</p>
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                  selectedContact?.id === contact.id
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-y-[-2px]'
                  : 'hover:bg-white hover:shadow-lg hover:shadow-slate-200/50'
                }`}
              >
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                    selectedContact?.id === contact.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-primary'
                  }`}>
                    {contact.name[0].toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 ${
                    selectedContact?.id === contact.id ? 'border-primary' : 'border-[#FBFBFE]'
                  } ${contact.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                </div>
                
                <div className="text-left flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`font-black truncate tracking-tight ${selectedContact?.id === contact.id ? 'text-white' : 'text-slate-800'}`}>
                      {contact.name}
                    </p>
                    <span className={`text-[10px] font-bold opacity-50 ${selectedContact?.id === contact.id ? 'text-white' : 'text-slate-400'}`}>12:45 PM</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs truncate font-bold leading-none ${selectedContact?.id === contact.id ? 'text-white/70' : 'text-primary'}`}>
                    <Hash size={12} className="opacity-50" />
                    {contact.skill}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                 <Search size={24} className="opacity-20" />
               </div>
               <p className="text-sm font-bold">No contacts match your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className={`flex-1 flex flex-col bg-white overflow-hidden ${!selectedContact ? 'hidden lg:flex' : 'flex'}`}>
        {selectedContact ? (
          <>
            {/* Professional Chat Header */}
            <div className="p-5 lg:p-6 px-6 lg:px-10 border-b border-slate-50 flex items-center justify-between z-10 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden -ml-2 rounded-xl h-10 w-10 text-slate-400"
                  onClick={() => setSelectedContact(null)}
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className="relative group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-lg shadow-primary/10">
                    <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-primary font-black text-xl">
                       {selectedContact.name[0].toUpperCase()}
                    </div>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${selectedContact.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                </div>
                <div>
                  <h4 className="font-black text-xl text-slate-800 leading-tight flex items-center gap-3">
                    {selectedContact.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{selectedContact.skill}</span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 ml-2">
                       <Circle size={8} className={selectedContact.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-slate-300 text-slate-300'} />
                       {selectedContact.status === 'online' ? 'Active now' : 'Yesterday'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:bg-slate-50 rounded-2xl"><Phone size={20} /></Button>
                 <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:bg-slate-50 rounded-2xl"><Video size={20} /></Button>
                 <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:bg-slate-50 rounded-2xl"><MoreVertical size={20} /></Button>
              </div>
            </div>

            {/* Chat Messages Flow */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 bg-[#FBFBFE] custom-scrollbar relative">
              <AnimatePresence>
                {messages.map((msg, index) => {
                  const isMe = msg.sender === user.id;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] lg:max-w-[60%] flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                         {!isMe && (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 self-end mb-4">
                              {selectedContact.name[0].toUpperCase()}
                            </div>
                         )}
                         <div className="space-y-2">
                            <div className={`p-5 rounded-[24px] shadow-sm text-sm font-medium leading-relaxed ${
                              isMe 
                              ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/20' 
                              : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                            }`}>
                              {msg.message}
                            </div>
                            <p className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isMe ? 'text-right pr-2' : 'text-left pl-2'}`}>
                               {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* LinkedIn-style Message Box */}
            <div className="p-6 lg:p-8 bg-white border-t border-slate-50">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                <div className="flex-1 relative group">
                  <Input
                    className="flex-1 border-none bg-slate-50 h-16 rounded-[24px] px-8 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-inner"
                    placeholder={`Message ${selectedContact.name.split(' ')[0]}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </div>
                <Button 
                  size="icon" 
                  className="h-16 w-16 rounded-[24px] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-white" 
                  type="submit"
                  disabled={!newMessage.trim()}
                >
                  <Send size={22} className="relative left-[1px]" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-10 relative overflow-hidden bg-[#FBFBFE]">
             {/* Decorative Circles */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative">
                <div className="w-32 h-32 rounded-[40px] bg-white flex items-center justify-center shadow-2xl shadow-slate-200 animate-bounce transition-all duration-[2s]">
                   <MessageSquare size={54} className="text-primary opacity-20" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 rotate-12">
                   <Sparkles size={20} />
                </div>
             </div>
             <div>
               <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Select a Conversation</h3>
               <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                 Coordinate with your mutual learners, share resources, and growth together. Every exchange starts with a hello.
               </p>
             </div>
             <div className="flex gap-4">
                <Button variant="primary" className="rounded-full px-10 h-12 shadow-xl shadow-primary/20">Find Learners</Button>
                <Button variant="ghost" className="rounded-full px-10 h-12 text-slate-400">Archived Chats</Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
