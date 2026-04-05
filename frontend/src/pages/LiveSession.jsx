import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LiveSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState([]);
    const [youtubeLink, setYoutubeLink] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [docUrl, setDocUrl] = useState('');

    const socketRef = useRef();

    useEffect(() => {
        // Fetch session details
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

        // Setup socket connection
        socketRef.current = io(SOCKET_SERVER_URL);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-session', id);
        });

        socketRef.current.on('receive-resource', (resource) => {
            setResources((prev) => [...prev, resource]);
        });

        return () => {
            socketRef.current.emit('leave-session', id);
            socketRef.current.disconnect();
        };
    }, [id, navigate]);

    // Extract YouTube ID
    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleShareYoutube = async (e) => {
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

        // Save to DB via API
        try {
            const token = localStorage.getItem('token');
            await fetch(`${SOCKET_SERVER_URL}/api/session/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: id,
                    ...newResource
                })
            });

            // Emit via socket
            socketRef.current.emit('share-youtube-link', { sessionId: id, resource: newResource });
            setYoutubeLink('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleShareDocument = async (e) => {
        e.preventDefault();
        if (!uploadFile && !docUrl) return;

        let finalUrl = docUrl;
        let title = 'Shared Document';

        if (uploadFile) {
            // Upload file to backend
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
            await fetch(`${SOCKET_SERVER_URL}/api/session/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: id,
                    ...newResource
                })
            });

            socketRef.current.emit('share-document', { sessionId: id, resource: newResource });
            setDocUrl('');
            setUploadFile(null);
            // Reset file input by re-rendering key or just clearing state
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center bg-slate-50 h-screen">Loading session...</div>;

    return (
        <div className="flex flex-col h-screen max-w-6xl mx-auto p-4 gap-6 bg-slate-50">
            {/* Session Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Live Learning Session</h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 font-medium">
                        <span>Participants: {session?.participants?.map(p => p.name).join(', ') || 'No others joined yet'}</span>
                        <span className="mx-2 text-slate-300">•</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${session?.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {session?.status?.toUpperCase()}
                        </span>
                    </div>
                </div>
                <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg shadow-sm hover:bg-slate-700 transition">
                    Leave Session
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                {/* Left Column: Interaction & Forms */}
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto">
                    {/* WebRTC Placeholder Area */}
                    <div className="bg-slate-900 rounded-xl aspect-[4/3] flex items-center justify-center relative overflow-hidden text-white shadow-lg border border-slate-800 group">
                        <div className="text-center group-hover:scale-110 transition duration-300">
                            <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner">
                                🎥
                            </div>
                            <p className="text-sm font-medium text-slate-400">Host Video Area (WebRTC)</p>
                        </div>
                    </div>

                    {/* Resource Sharing Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-5">
                        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <span className="text-xl">🚀</span> Share Resources
                        </h2>

                        {/* YouTube Share Form */}
                        <form onSubmit={handleShareYoutube} className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700">Share YouTube Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={youtubeLink}
                                    onChange={(e) => setYoutubeLink(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                />
                                <button type="submit" className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-semibold shadow-sm transition">
                                    Share
                                </button>
                            </div>
                        </form>

                        <div className="h-px bg-slate-100 w-full my-1"></div>

                        {/* Document Share Form */}
                        <form onSubmit={handleShareDocument} className="flex flex-col gap-3">
                            <label className="text-sm font-semibold text-slate-700">Share Document</label>

                            <div className="flex flex-col gap-3">
                                <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 hover:bg-slate-100 transition text-center focus-within:ring-2 focus-within:ring-blue-500">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        className="text-sm cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition"
                                    />
                                </div>

                                <div className="relative flex items-center justify-center my-1">
                                    <div className="border-t border-slate-200 w-full absolute"></div>
                                    <span className="bg-white px-2 text-xs font-bold text-slate-400 relative z-10">OR</span>
                                </div>

                                <input
                                    type="text"
                                    value={docUrl}
                                    onChange={(e) => setDocUrl(e.target.value)}
                                    placeholder="Paste URL..."
                                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                                <button type="submit" className="w-full mt-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-semibold shadow-sm transition">
                                    Upload & Share Document
                                </button>
                            </div>
                        </form>

                    </div>
                </div>

                {/* Right Column: Shared Resources Feed */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <span className="text-xl">📚</span> Shared Resources Feed
                        </h2>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
                            {resources.length} Items
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar pb-6 relative">
                        {resources.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-400 py-10 mt-10">
                                <div className="text-5xl mb-4 opacity-50">📭</div>
                                <p className="font-medium text-slate-500">No resources shared yet.</p>
                                <p className="text-sm mt-1">Share a document or video to get started.</p>
                            </div>
                        ) : (
                            resources.map((res, index) => (
                                <div key={index} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition flex flex-col gap-3 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={`text-[10px] tracking-wider font-bold px-2 py-1 rounded-md inline-block mb-2 uppercase ${res.type === 'youtube' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {res.type}
                                            </span>
                                            <h3 className="font-semibold text-slate-800 break-all leading-tight">{res.title || 'Shared Resource'}</h3>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-full shadow-sm">
                                            {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {res.type === 'youtube' ? (
                                        <div className="aspect-video mt-2 rounded-xl overflow-hidden bg-slate-900 shadow-inner border border-slate-200">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={res.url}
                                                title="YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="border-0"
                                            />
                                        </div>
                                    ) : (
                                        <a
                                            href={res.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 rounded-lg text-sm font-semibold transition shadow-sm w-fit group"
                                        >
                                            <span className="text-lg group-hover:-translate-y-0.5 transition">📄</span>
                                            Open Document
                                            <span className="text-slate-300 ml-1 group-hover:text-blue-400">↗</span>
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSession;
