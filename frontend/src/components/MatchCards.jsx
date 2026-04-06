import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { findMatches, sendMatchRequest } from '../services/matchService';
import { createRealtimeSession } from '../services/sessionService';
import { useSocket } from '../context/SocketContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Video, Send, Zap, Star, Award, BookOpen } from 'lucide-react';

const MatchCards = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const { initiateCall } = useSocket();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await findMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (receiverId, skill) => {
    try {
      await sendMatchRequest(receiverId, skill);
      setMessage({ type: 'success', text: `Request sent for ${skill}!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send request' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleStartSession = async (targetUser, skill) => {
    try {
      // 1. Create the session in the DB
      const session = await createRealtimeSession(targetUser.id);
      
      // 2. Trigger the Socket invitation
      initiateCall(targetUser.id, targetUser.name, session.sessionId);
      
      setMessage({ type: 'success', text: `Calling ${targetUser.name}...` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to start session:', error);
      setMessage({ type: 'error', text: 'Failed to start video session' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 rounded-xl text-center font-medium shadow-lg ${
              message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {matches.map((match, index) => (
            <motion.div
              key={match.user.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group h-full flex flex-col hover:border-primary/40 transition-all border-none shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-primary shadow-inner border border-white">
                    {match.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                       {match.user.name}
                       {match.score > 80 && <Zap size={16} className="text-accent fill-accent" />}
                    </CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1 text-orange-500 font-bold">
                        <Star size={14} className="fill-orange-500" /> {match.user.rating || '5.0'}
                      </span>
                      <Badge variant="subtle" className="bg-slate-100 text-slate-600 border-none">
                        {match.user.experienceLevel}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary leading-none">{match.score}%</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1 text-center">Match</div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  {/* Skills Section */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Award size={12} className="text-primary" /> They can teach you
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.matchedSkills.theyCanTeachYou.map(skill => (
                          <Badge 
                            key={skill} 
                            variant="primary" 
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border-indigo-100 cursor-pointer transition-colors"
                            onClick={() => handleRequest(match.user.id, skill)}
                          >
                            {skill} <Plus size={10} className="ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <BookOpen size={12} className="text-secondary" /> You can teach them
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.matchedSkills.youCanTeachThem.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-cyan-50 text-cyan-700 border-cyan-100">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                  <Button 
                    variant="outline" 
                    className="gap-2 font-bold hover:bg-slate-50 border-slate-200"
                    onClick={() => handleRequest(match.user.id, match.matchedSkills.theyCanTeachYou[0])}
                    disabled={match.matchedSkills.theyCanTeachYou.length === 0}
                  >
                    <Send size={16} /> Send Request
                  </Button>
                  <Button 
                    className="gap-2 font-bold bg-primary hover:bg-primary/90"
                    onClick={() => handleStartSession(match.user, match.matchedSkills.theyCanTeachYou[0])}
                    disabled={match.matchedSkills.theyCanTeachYou.length === 0}
                  >
                    <Video size={16} /> Start Video
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center border-dashed border-2 bg-muted/20">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100">
            <Search size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No matches found yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Try updating your profile with more skills or experience levels to find the perfect mutual learner.
          </p>
          <Button variant="primary" className="mt-8" onClick={() => window.location.reload()}>
            Refresh Algorithm
          </Button>
        </Card>
      )}
    </div>
  );
};

const Plus = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default MatchCards;
