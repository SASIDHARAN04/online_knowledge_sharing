import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Bell, Check, Phone, MessageCircle, X, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

const NotificationPopover = ({ isOpen, onClose, onSelectSection }) => {
    const { notifications, markAsRead, markAllAsRead } = useSocket();
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-16 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[100] overflow-hidden flex flex-col max-h-[80vh]"
        >
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 uppercase tracking-widest">
                <h4 className="font-black text-slate-800 flex items-center gap-2 text-[10px]">
                    <Bell size={14} className="text-primary" />
                    Recent Activity
                </h4>
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-[9px] font-black text-primary hover:underline hover:text-primary/80 uppercase tracking-widest"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
                            <Bell size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800">All caught up!</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">No new notifications</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((n) => (
                            <div 
                                key={n._id}
                                onClick={() => {
                                    markAsRead(n._id);
                                    if (n.type === 'call' && n.sessionId) {
                                        navigate(`/session/${n.sessionId}`);
                                        onClose();
                                    } else if (n.type === 'message') {
                                        if (onSelectSection) onSelectSection('chat');
                                        onClose();
                                    }
                                }}
                                className={`p-5 border-b border-slate-50 transition-all hover:bg-slate-50 flex gap-4 cursor-pointer group ${!n.isRead ? 'bg-primary/5' : ''}`}
                            >
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                    n.type === 'call' ? 'bg-green-500 text-white shadow-green-200' : 
                                    n.type === 'message' ? 'bg-blue-500 text-white shadow-blue-200' : 
                                    'bg-slate-800 text-white shadow-slate-200'
                                }`}>
                                    {n.type === 'call' ? <Phone size={20} /> : 
                                     n.type === 'message' ? <MessageCircle size={20} /> : <Bell size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-xs font-black text-slate-800 leading-snug">
                                            {n.message}
                                        </p>
                                        {!n.isRead && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(n._id);
                                                }}
                                                className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0 animate-pulse"
                                                title="Mark as read"
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {n.type === 'call' && (
                                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                                Active Session <ExternalLink size={10} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-slate-50/30 border-t border-slate-50 text-center">
                <button 
                    onClick={onClose} 
                    className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-colors transition-all"
                >
                    Hide Panel
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationPopover;
