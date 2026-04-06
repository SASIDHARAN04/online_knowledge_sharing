import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [outgoingCall, setOutgoingCall] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        const userId = user?._id || user?.id;
        
        if (userId && !socketRef.current) {
            const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            console.log("SocketContext: Initializing global socket for user:", userId);
            
            const newSocket = io(socketUrl, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });
            
            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on("connect", () => {
                console.log("SocketContext: Connected with ID:", newSocket.id);
                newSocket.emit("join", userId);
            });

            newSocket.on("incoming-call", (data) => {
                console.log("SocketContext: Incoming call received from:", data.from.name);
                setIncomingCall(data);
            });

            newSocket.on("call-accepted", (data) => {
                console.log("SocketContext: Call accepted for session:", data.sessionId);
                setOutgoingCall(null);
                navigate(`/session/${data.sessionId}`);
            });

            newSocket.on("call-rejected", () => {
                setOutgoingCall(prev => prev ? { ...prev, status: 'declined' } : null);
                setTimeout(() => setOutgoingCall(null), 3000);
            });

            newSocket.on("new-notification", (notification) => {
                console.log("SocketContext: New notification received:", notification);
                setNotifications(prev => [notification, ...prev]);
            });

            return () => {
                console.log("SocketContext: Cleaning up socket...");
                newSocket.disconnect();
                socketRef.current = null;
                setSocket(null);
            };
        }
    }, [user?._id, user?.id, navigate]);

    // Initial fetch of notifications
    useEffect(() => {
        if (user?._id || user?.id) {
            fetchNotifications();
        }
    }, [user?._id, user?.id]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications');
            if (res.data.success) {
                setNotifications(res.data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all notifications read:', error);
        }
    };

    const initiateCall = (targetUserId, targetUserName, sessionId) => {
        const userId = user?._id || user?.id;
        if (socketRef.current && socketRef.current.connected) {
            setOutgoingCall({ toName: targetUserName, status: 'calling' });
            socketRef.current.emit("request-call", {
                to: targetUserId,
                from: { 
                    id: userId, 
                    name: user?.name, 
                    avatar: user?.avatar 
                },
                sessionId
            });
        } else {
            console.error("SocketContext: Cannot initiate call - socket not connected");
            alert("Connection error. Please refresh and try again.");
        }
    };

    const acceptCall = () => {
        if (socketRef.current && incomingCall) {
            socketRef.current.emit("accept-call", {
                to: incomingCall.from.id,
                sessionId: incomingCall.sessionId
            });
            navigate(`/session/${incomingCall.sessionId}`);
            setIncomingCall(null);
        }
    };

    const declineCall = () => {
        if (socketRef.current && incomingCall) {
            socketRef.current.emit("decline-call", {
                to: incomingCall.from.id
            });
            setIncomingCall(null);
        }
    };

    return (
        <SocketContext.Provider value={{ 
            socket: socketRef.current, 
            incomingCall, 
            outgoingCall,
            notifications,
            initiateCall, 
            acceptCall, 
            declineCall,
            markAsRead,
            markAllAsRead,
            fetchNotifications
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
