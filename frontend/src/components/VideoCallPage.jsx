import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getSessionDetails } from '../services/sessionService';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, PhoneCall, Maximize2, Settings, User, Share2, Upload, Link2, X } from 'lucide-react';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VideoCallPage = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [stream, setStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [pc, setPc] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  // Active Document Viewer state
  const [activeDocument, setActiveDocument] = useState(null);

  // Resource sharing states
  const [resources, setResources] = useState([]);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const sessionData = await getSessionDetails(sessionId);
        setSession(sessionData);
        setResources(sessionData.sharedResources || []);

        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userMedia);
        if (localVideoRef.current) localVideoRef.current.srcObject = userMedia;

        const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
        const newSocket = io(socketUrl);
        setSocket(newSocket);
        newSocket.emit('join', user.id);
        newSocket.emit('join-session', sessionId);

        newSocket.on('receive-resource', (resource) => {
          setResources((prev) => [...prev, resource]);
        });

        newSocket.on('open-document', (doc) => {
          setActiveDocument(doc);
        });

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        setPc(peerConnection);

        userMedia.getTracks().forEach(track => peerConnection.addTrack(track, userMedia));

        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
          setIsJoined(true);
        };

        const otherParticipant = sessionData.participants.find(p => p._id !== user.id);

        newSocket.on('call-made', async (data) => {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
          newSocket.emit('make-answer', { answer, to: data.from });
        });

        newSocket.on('answer-made', async (data) => {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        newSocket.on('ice-candidate', (data) => {
          peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        });

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            newSocket.emit('ice-candidate', {
              candidate: event.candidate,
              to: otherParticipant._id,
              from: user.id
            });
          }
        };

      } catch (err) {
        console.error('Failed to init video call:', err);
      }
    };

    init();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (socket) {
        socket.emit('leave-session', sessionId);
        socket.close();
      }
      if (pc) pc.close();
    };
  }, [sessionId, user.id]);

  const handleCall = async () => {
    if (!pc || !socket || !session) return;
    const otherParticipant = session.participants.find(p => p._id !== user.id);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(new RTCSessionDescription(offer));
    socket.emit('call-user', { offer, to: otherParticipant._id, from: user.id });
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCamOn(videoTrack.enabled);
    }
  };

  const endCall = () => {
    navigate('/dashboard');
  };

  // Extract YouTube ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const shareYoutube = async (e) => {
    e.preventDefault();
    if (!youtubeLink) return;

    const videoId = getYouTubeId(youtubeLink);
    if (!videoId) return alert('Invalid YouTube URL');

    const newResource = {
      type: 'youtube',
      url: `https://www.youtube.com/embed/${videoId}`,
      title: 'YouTube Video',
      sharedBy: user?._id || 'Me',
      timestamp: new Date()
    };

    try {
      const token = localStorage.getItem('token');
      await fetch(`${SOCKET_SERVER_URL}/api/sessions/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: sessionId,
          ...newResource
        })
      });

      socket.emit('share-youtube-link', { sessionId: sessionId, resource: newResource });
      setYoutubeLink('');
    } catch (err) {
      console.error(err);
    }
  };

  const shareDocument = async (e) => {
    e.preventDefault();
    if (!uploadFile && !docUrl) return;

    let finalUrl = docUrl;
    let title = 'Shared Document';

    if (uploadFile) {
      const formData = new FormData();
      formData.append('file', uploadFile);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${SOCKET_SERVER_URL}/api/sessions/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        finalUrl = data.url;
        title = uploadFile.name;
      } catch (err) {
        console.error('Upload failed', err);
        return;
      }
    }

    const newResource = {
      type: 'document',
      url: finalUrl,
      title,
      sharedBy: user?._id || 'Me',
      timestamp: new Date()
    };

    try {
      const token = localStorage.getItem('token');
      await fetch(`${SOCKET_SERVER_URL}/api/sessions/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: sessionId,
          ...newResource
        })
      });

      socket.emit('share-document', { sessionId: sessionId, resource: newResource });
      setDocUrl('');
      setUploadFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocumentClick = (doc) => {
    if (socket) {
      socket.emit('document-clicked', {
        sessionId,
        fileUrl: doc.url,
        fileName: doc.title,
        type: doc.type
      });
    }
  };


  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col font-sans selection:bg-primary/30 text-white overflow-hidden">
      {/* Header Info */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black">S</div>
          <div>
            <h2 className="text-white font-bold leading-none">{session?.skillExchange || 'Knowledge Exchange'}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge className="bg-green-500/20 text-green-400 border-none px-2 py-0.5 text-[10px]">LIVE</Badge>
              <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase">P2P Secure</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
        <Button
          onClick={() => setShowDocs(!showDocs)}
          variant="outline" size="icon"
          className={`border-white/10 rounded-xl transition ${showDocs ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
        >
          <Share2 size={20} />
        </Button>
        <Button variant="outline" size="icon" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
          <Settings size={20} />
        </Button>
        <Button variant="outline" size="icon" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
          <Maximize2 size={20} />
        </Button>
      </div>

      <div className="flex-1 w-full flex overflow-hidden pt-28 pb-32">
        {/* Main Video Arena */}
        <div className={`flex-1 relative flex items-center justify-center p-8 transition-all duration-300`}>
          <div className={`w-full h-full max-w-7xl grid gap-8 relative ${showDocs ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>

            {/* Remote Video Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-white/5 h-full min-h-[300px]"
            >
              {!isJoined && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-slate-900">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                    <User size={40} className="text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-medium tracking-tight">Waiting for participant...</p>
                </div>
              )}
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white text-sm font-bold border border-white/10 z-20">
                <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                {session?.participants?.find(p => p._id !== user.id)?.name || 'Peer'}
              </div>
            </motion.div>

            {/* Local Video Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-white/5 h-full min-h-[300px]"
            >
              {!isCamOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-slate-900/80 backdrop-blur-3xl transition-all">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <VideoOff size={40} className="text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-medium">Camera is off</p>
                </div>
              )}
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white text-sm font-bold border border-white/10 z-20">
                You (Me)
              </div>
              <div className="absolute top-6 right-6 z-20">
                {!isMicOn && (
                  <div className="p-2 bg-red-500/20 backdrop-blur-md rounded-lg border border-red-500/20">
                    <MicOff size={16} className="text-red-400" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Resources Panel Drawer */}
        <AnimatePresence>
          {showDocs && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col shrink-0 w-[400px]"
            >
              <div className="p-5 border-b border-white/10 shrink-0">
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Share2 size={18} className="text-blue-400" /> Share Resources</h3>

                {/* Share YouTube */}
                <form onSubmit={shareYoutube} className="mb-4">
                  <p className="text-[10px] text-slate-400 mb-1 font-bold tracking-wider">YOUTUBE LINK</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 h-auto py-1">Send</Button>
                  </div>
                </form>

                {/* Share Document */}
                <form onSubmit={shareDocument}>
                  <p className="text-[10px] text-slate-400 mb-1 font-bold tracking-wider">DOCUMENT (PDF/DOC)</p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl p-3 cursor-pointer hover:border-slate-500 transition">
                      <Upload size={16} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-300">{uploadFile ? uploadFile.name : 'Upload File'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                      />
                    </label>
                    <div className="flex items-center gap-2 my-1">
                      <div className="h-px bg-slate-800 flex-1"></div>
                      <span className="text-[10px] text-slate-500 font-bold tracking-widest">OR</span>
                      <div className="h-px bg-slate-800 flex-1"></div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="External URL..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                      <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 h-auto py-1">Share</Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Resource Feed */}
              <div className="flex-1 p-5 overflow-y-auto">
                <h3 className="font-bold text-lg text-white mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Link2 size={18} className="text-emerald-400" /> Feed</span>
                  <Badge className="bg-slate-800">{resources.length}</Badge>
                </h3>
                <div className="flex flex-col gap-4">
                  {resources.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 text-sm font-medium">
                      No resources shared yet
                    </div>
                  ) : (
                    resources.map((res, i) => (
                      <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Badge className={`text-[10px] ${res.type === 'youtube' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {res.type.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-slate-500">{new Date(res.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm font-semibold truncate" title={res.title}>{res.title}</p>

                        {res.type === 'youtube' ? (
                          <div className="aspect-video mt-2 rounded-lg overflow-hidden bg-black/50 border border-slate-700">
                            <iframe
                              src={res.url}
                              className="w-full h-full border-0"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDocumentClick(res)}
                            className="mt-2 block w-full text-center bg-slate-700 hover:bg-slate-600 transition p-2 rounded-lg text-xs font-bold text-white shadow-sm"
                          >
                            Open Document
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Synchronized Document Viewer Modal */}
      <AnimatePresence>
        {activeDocument && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-4 z-50 bg-slate-900 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/20 flex flex-col overflow-hidden"
          >
            <div className="h-16 bg-slate-800/80 backdrop-blur-md flex items-center justify-between px-6 border-b border-white/10 shrink-0">
              <h2 className="font-bold text-lg text-white truncate max-w-[80%]">📄 {activeDocument.fileName || 'Shared Document'}</h2>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500/20 text-emerald-400">Live Synced</Badge>
                <Button
                  onClick={() => setActiveDocument(null)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full w-10 h-10"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-white">
              {activeDocument.fileUrl && (activeDocument.fileUrl.endsWith('.pdf') || activeDocument.type === 'pdf') ? (
                <iframe
                  src={activeDocument.fileUrl}
                  width="100%"
                  height="100%"
                  className="border-none w-full h-full"
                  title="PDF Viewer"
                />
              ) : (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(activeDocument.fileUrl)}&embedded=true`}
                  width="100%"
                  height="100%"
                  className="border-none w-full h-full"
                  title="DOC Viewer"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bar */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-20">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/10 p-4 px-8 rounded-3xl flex items-center gap-6 shadow-2xl"
        >
          <Button
            onClick={toggleMic}
            className={`w-14 h-14 rounded-2xl transition-all ${!isMicOn ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </Button>

          <Button
            onClick={toggleCam}
            className={`w-14 h-14 rounded-2xl transition-all ${!isCamOn ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
          </Button>

          <div className="w-px h-10 bg-white/10 mx-2"></div>

          <Button
            onClick={handleCall}
            className="h-14 px-8 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-green-500/20"
          >
            <PhoneCall size={20} />
            Start Session
          </Button>

          <Button
            onClick={endCall}
            className="h-14 px-8 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest gap-3 border border-white/10"
          >
            Leave
          </Button>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .mirror { transform: scaleX(-1); }
      `}} />
    </div>
  );
};

export default VideoCallPage;
