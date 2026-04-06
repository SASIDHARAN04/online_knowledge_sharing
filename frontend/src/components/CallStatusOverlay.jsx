import React from 'react';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Video, Loader2 } from 'lucide-react';

const CallStatusOverlay = () => {
    const { outgoingCall } = useSocket();

    return (
        <AnimatePresence>
            {outgoingCall && (
                <div className="fixed bottom-8 right-8 z-[9999] w-72">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className={`p-5 rounded-3xl shadow-2xl flex flex-col gap-4 border ${
                            outgoingCall.status === 'declined' ? 'bg-red-50 border-red-100 shadow-red-100/50' : 'bg-white border-slate-100 shadow-slate-200/50'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                outgoingCall.status === 'declined' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                            }`}>
                                {outgoingCall.status === 'declined' ? <X size={24} /> : <Loader2 size={24} className="animate-spin" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-black text-slate-800 text-sm truncate">{outgoingCall.toName}</h4>
                                <p className={`text-[10px] font-black uppercase tracking-[0.15em] mt-0.5 ${
                                    outgoingCall.status === 'declined' ? 'text-red-500' : 'text-primary animate-pulse'
                                }`}>
                                    {outgoingCall.status === 'declined' ? 'Request Declined' : 'Requesting Video...'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CallStatusOverlay;
