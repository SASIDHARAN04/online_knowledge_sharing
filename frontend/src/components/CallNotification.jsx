import React from "react";
import { useSocket } from "../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, X, Check } from "lucide-react";
import { Button } from "./ui/Button";

const CallNotification = () => {
    const { incomingCall, acceptCall, declineCall } = useSocket();

    return (
        <AnimatePresence>
            {incomingCall && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-6 flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-lg shadow-primary/20">
                                    <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-primary font-black text-2xl">
                                        {incomingCall.from.name[0].toUpperCase()}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-800 leading-tight">
                                    {incomingCall.from.name}
                                </h4>
                                <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2">
                                    <Video size={14} className="text-secondary" />
                                    Incoming Video Call...
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={declineCall}
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl border-2 border-slate-50 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all font-bold gap-2 text-slate-500"
                            >
                                <X size={20} />
                                Decline
                            </Button>
                            <Button
                                onClick={acceptCall}
                                className="flex-1 h-12 rounded-2xl bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 transition-all font-bold gap-2 text-white"
                            >
                                <Check size={20} />
                                Accept
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CallNotification;
