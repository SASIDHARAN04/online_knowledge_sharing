import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, MicOff, Video as VideoIcon, VideoOff, 
    PhoneOff, Share, Layout, Youtube, FileText, 
    Users, Shield, Zap, ExternalLink, Clock, Send, Link as LinkIcon, Upload
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LiveSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket } = useSocket();
    
    // Core State
    const [session, setSession] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [activeTab, setActiveTab] = useState('resources');
    
    // Form States
    const [youtubeLink, setYoutubeLink] = useState('');
    const [customLink, setCustomLink] = useState('');
    const [docUrl, setDocUrl] = useState('');
    const [uploadFile, setUploadFile] = useState(null);

    // Refs for WebRTC Stability
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pcRef = useRef();
    const localStreamRef = useRef();
    const pendingCandidates = useRef([]);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${SOCKET_SERVER_URL}/api/session/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Session not found');
                const data = await res.json();
                setSession(data);
                setResources(data.sharedResources || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate('/dashboard');
            }
        };
        fetchSession();

        if (socket) {
            const setupSession = async () => {
                await startLocalStream();
                socket.emit('join-session', id);
            };

            const handleReceiveResource = (resource) => {
                setResources((prev) => [resource, ...prev]);
            };

            const handleUserJoined = async ({ socket: joinedSocketId }) => {
                console.log('LiveSession: Peer joined signaling. Initiating Call in 200ms...');
                // Adding a small delay to ensure receiver's socket is fully ready
                setTimeout(() => initiateCall(joinedSocketId), 200);
            };

            const handleCallMade = async (data) => {
                console.log('LiveSession: Received WebRTC Offer');
                await handleReceivedOffer(data);
            };

            const handleAnswerMade = async (data) => {
                console.log('LiveSession: Received WebRTC Answer');
                await handleReceivedAnswer(data);
            };

            const handleIceCandidate = async (data) => {
                if (pcRef.current && pcRef.current.remoteDescription) {
                    try {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    } catch (e) {
                         console.error('Error adding direct ice candidate', e);
                    }
                } else {
                    pendingCandidates.current.push(data.candidate);
                }
            };

            socket.on('receive-resource', handleReceiveResource);
            socket.on('user-joined', handleUserJoined);
            socket.on('call-made', handleCallMade);
            socket.on('answer-made', handleAnswerMade);
            socket.on('ice-candidate', handleIceCandidate);

            setupSession();

            return () => {
                socket.emit('leave-session', id);
                socket.off('receive-resource', handleReceiveResource);
                socket.off('user-joined', handleUserJoined);
                socket.off('call-made', handleCallMade);
                socket.off('answer-made', handleAnswerMade);
                socket.off('ice-candidate', handleIceCandidate);
            };
        }
    }, [id, navigate, socket]);

    // Dedicated Media Ref Binding
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, loading]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (pcRef.current) {
                pcRef.current.close();
            }
        };
    }, []);

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                }, 
                audio: true 
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Error: Media access denied', err);
            return null;
        }
    };

    const processPendingCandidates = async (pc) => {
        if (pc.remoteDescription && pendingCandidates.current.length > 0) {
            console.log('LiveSession: Processing queued ICE candidates...');
            for (const candidateData of pendingCandidates.current) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidateData));
                } catch (e) {
                    console.error('Error adding queued candidate', e);
                }
            }
            pendingCandidates.current = [];
        }
    };

    const createPeerConnection = (targetSocketId) => {
        if (pcRef.current) {
            pcRef.current.close();
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: targetSocketId
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`LiveSession: Connected to Remote ${event.track.kind} Track`);
            if (event.streams && event.streams[0]) {
                const stream = event.streams[0];
                setRemoteStream(stream);
                // Directly bind stream to the video element to bypass React batching delays
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                }
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('LiveSession: Connection State ->', pc.iceConnectionState);
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                setRemoteStream(null);
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pcRef.current = pc;
        return pc;
    };

    const initiateCall = async (targetSocketId) => {
        const pc = createPeerConnection(targetSocketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('call-user', { offer, to: targetSocketId });
    };

    const handleReceivedOffer = async ({ offer, socket: remoteSocketId }) => {
        const pc = createPeerConnection(remoteSocketId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processPendingCandidates(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('make-answer', { answer, to: remoteSocketId });
    };

    const handleReceivedAnswer = async ({ answer }) => {
        if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            await processPendingCandidates(pcRef.current);
        }
    };

    const toggleMic = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMicOn(!isMicOn);
        }
    };

    const toggleCamera = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsCameraOn(!isCameraOn);
        }
    };

    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleShareYoutube = async (e) => {
        e.preventDefault();
        const videoId = getYouTubeId(youtubeLink);
        if (!videoId) return;

        const newResource = {
            type: 'youtube',
            url: `https://www.youtube.com/embed/${videoId}`,
            title: 'Learning Resource',
            sharedBy: user?._id || user?.id,
            timestamp: new Date()
        };

        try {
            const token = localStorage.getItem('token');
            await fetch(`${SOCKET_SERVER_URL}/api/session/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ sessionId: id, ...newResource })
            });
            socket.emit('share-youtube-link', { sessionId: id, resource: newResource });
            setYoutubeLink('');
            setActiveTab('resources');
        } catch (err) { console.error(err); }
    };

    const handleShareLink = async (e) => {
        e.preventDefault();
        if (!customLink) return;

        const newResource = {
            type: 'link',
            url: customLink.startsWith('http') ? customLink : `https://${customLink}`,
            title: 'Shared Link',
            sharedBy: user?._id || user?.id,
            timestamp: new Date()
        };

        try {
            const token = localStorage.getItem('token');
            await fetch(`${SOCKET_SERVER_URL}/api/session/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ sessionId: id, ...newResource })
            });
            socket.emit('share-youtube-link', { sessionId: id, resource: newResource }); // Reusing generic resource emit
            setCustomLink('');
            setActiveTab('resources');
        } catch (err) { console.error(err); }
    };

    const handleShareDocument = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        let finalUrl = '';
        let title = uploadFile.name;

        const formData = new FormData();
        formData.append('file', uploadFile);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${SOCKET_SERVER_URL}/api/session/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            finalUrl = data.url;
        } catch (err) {
            console.error('Upload failed', err);
            return;
        }

        const ext = title.split('.').pop().toLowerCase();
        let resourceType = 'document';
        if (ext === 'pdf') resourceType = 'pdf';
        if (ext === 'doc' || ext === 'docx') resourceType = 'docx';

        const newResource = {
            type: resourceType,
            url: finalUrl,
            title,
            sharedBy: user?._id || user?.id,
            timestamp: new Date()
        };

        try {
            const token = localStorage.getItem('token');
            await fetch(`${SOCKET_SERVER_URL}/api/session/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ sessionId: id, ...newResource })
            });
            socket.emit('share-youtube-link', { sessionId: id, resource: newResource });
            setUploadFile(null);
            setActiveTab('resources');
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white flex-col gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Initializing Session...</p>
        </div>
    );

    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-slate-100 selection:bg-primary/30">
            {/* Elegant Header */}
            <header className="h-16 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[1px] shadow-lg shadow-primary/20">
                        <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center">
                            <Zap size={20} className="text-primary fill-primary/20" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-widest uppercase truncate max-w-[200px]">Live Learning</h1>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <Users size={12} /> {session?.participants?.length} Participant(s) 
                            <span className="mx-1">•</span> 
                            <span className="text-green-500 flex items-center gap-1"><Shield size={10} /> Secure Connection</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-5 px-5 py-2 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Status</span>
                            <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Active</span>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">Encryption</span>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">P2P</span>
                        </div>
                    </div>
                    <Button 
                        onClick={() => navigate('/dashboard')}
                        variant="destructive"
                        className="h-10 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all shadow-none"
                    >
                        Leave Session
                    </Button>
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 flex overflow-hidden lg:flex-row flex-col">
                {/* Left Side: Video Feeds */}
                <div className="flex-1 relative bg-slate-950 p-6 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50 animate-pulse"></div>

                    {/* Remote Video (Main) */}
                    <div className="relative w-full h-full max-w-5xl rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/5 bg-slate-900 group">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <AnimatePresence>
                            {!remoteStream && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 gap-6"
                                >
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center">
                                            <Users size={40} className="text-primary/40" />
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-black tracking-widest uppercase">Connecting Peer</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase mt-2 italic">Awaiting secure stream handover...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Local PiP */}
                        <div className="absolute top-6 left-6 w-48 aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-slate-800 z-30 group-hover:scale-105 transition-transform duration-500 shadow-black/80">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            {!isCameraOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 backdrop-blur-lg">
                                    <VideoOff size={20} className="text-slate-500" />
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 py-2 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl z-40 transition-all duration-300 hover:bg-slate-900/60 group-hover:translate-y-0 translate-y-4 opacity-0 group-hover:opacity-100">
                            <button 
                                onClick={toggleMic}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isMicOn ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20'}`}
                            >
                                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button 
                                onClick={toggleCamera}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isCameraOn ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20'}`}
                            >
                                {isCameraOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                            </button>
                            <div className="w-px h-8 bg-white/10 mx-2"></div>
                            <button 
                                onClick={() => setActiveTab('share')}
                                className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all shadow-lg shadow-primary/20"
                                title="Share Resource"
                            >
                                <Share size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Sidebar */}
                <div className="w-full lg:w-[400px] shrink-0 bg-slate-900/30 backdrop-blur-xl border-l border-white/5 flex flex-col z-50">
                    <div className="flex bg-slate-900/40 p-1 rounded-2xl m-4 border border-white/5 shrink-0">
                        <button 
                            onClick={() => setActiveTab('resources')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'resources' ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Layout size={14} /> Knowledge Hub
                        </button>
                        <button 
                            onClick={() => setActiveTab('share')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'share' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Share size={14} /> Collaborative Tools
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-8">
                        {activeTab === 'resources' ? (
                            <div className="space-y-6 pt-2">
                                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Stream</h3>
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">{resources.length} ITEMS</span>
                                </div>

                                {resources.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center gap-4 opacity-30 group">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center transition-all group-hover:scale-110">
                                            <FileText size={32} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Feed Empty</p>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {resources.map((res, index) => (
                                            <div key={index} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4 shadow-2xl">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${res.type === 'youtube' ? 'bg-red-500/10 text-red-500' : res.type === 'link' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                            {res.type === 'youtube' ? <Youtube size={18} /> : res.type === 'link' ? <LinkIcon size={18} /> : <FileText size={18} />}
                                                        </div>
                                                        <h4 className="text-[10px] font-black uppercase max-w-[140px] truncate">{res.title}</h4>
                                                    </div>
                                                    <a href={res.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>

                                                {res.type === 'youtube' && (
                                                    <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-white/5 group-hover:scale-[1.02] transition-transform duration-500">
                                                        <iframe width="100%" height="100%" src={res.url} title="Video" frameBorder="0" allowFullScreen />
                                                    </div>
                                                )}
                                                {res.type === 'pdf' && (
                                                    <div className="h-64 rounded-2xl overflow-hidden bg-white shadow-inner border border-white/5 mt-2">
                                                        <iframe width="100%" height="100%" src={res.url} title="PDF Viewer" frameBorder="0" />
                                                    </div>
                                                )}
                                                {res.type === 'docx' && (
                                                    <div className="h-64 rounded-2xl overflow-hidden bg-white shadow-inner border border-white/5 mt-2">
                                                        <iframe width="100%" height="100%" src={`https://docs.google.com/gview?url=${encodeURIComponent(res.url)}&embedded=true`} title="Doc Viewer" frameBorder="0" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 pt-2">
                                {/* Share YouTube */}
                                <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2"><Youtube size={14} /> Share YouTube</h3>
                                    <form onSubmit={handleShareYoutube} className="space-y-3">
                                        <input 
                                            type="text" 
                                            value={youtubeLink}
                                            onChange={(e) => setYoutubeLink(e.target.value)}
                                            placeholder="Paste URL..."
                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-[10px] font-bold focus:border-primary/50 transition-all"
                                        />
                                        <Button type="submit" className="w-full h-12 rounded-2xl bg-primary font-black uppercase tracking-widest text-[10px]">
                                            Embed Video <Send size={14} className="ml-2" />
                                        </Button>
                                    </form>
                                </div>

                                {/* Share Link */}
                                <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2"><LinkIcon size={14} /> Share Web Link</h3>
                                    <form onSubmit={handleShareLink} className="space-y-3">
                                        <input 
                                            type="text" 
                                            value={customLink}
                                            onChange={(e) => setCustomLink(e.target.value)}
                                            placeholder="Paste Any URL..."
                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-[10px] font-bold focus:border-primary/50 transition-all"
                                        />
                                        <Button type="submit" className="w-full h-12 rounded-2xl bg-primary font-black uppercase tracking-widest text-[10px]">
                                            Send Link <Send size={14} className="ml-2" />
                                        </Button>
                                    </form>
                                </div>

                                {/* Upload Document */}
                                <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2"><Upload size={14} /> Upload Document</h3>
                                    <form onSubmit={handleShareDocument} className="space-y-3">
                                        <div className="w-full bg-slate-900 border border-white/5 border-dashed rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-800 transition-all">
                                            <input 
                                                type="file" 
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setUploadFile(e.target.files[0])}
                                                className="w-full text-[10px] text-slate-400 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                                            />
                                        </div>
                                        <Button type="submit" disabled={!uploadFile} className="w-full h-12 rounded-2xl bg-primary font-black uppercase tracking-widest text-[10px] disabled:opacity-50">
                                            Upload & Share <Upload size={14} className="ml-2" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveSession;
