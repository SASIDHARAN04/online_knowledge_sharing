import React, { useState, useEffect } from 'react';
import { getMyRequests, createRequest, updateRequestStatus } from '../services/requestService';
import { getAllUsers } from '../services/userService';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Send, Plus, Check, X, User, BookOpen, Clock } from 'lucide-react';

const RequestsPanel = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ receiverId: '', skillExchange: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getMyRequests();
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRequest(formData);
      setFormData({ receiverId: '', skillExchange: '' });
      setShowForm(false);
      setMessage({ type: 'success', text: 'Request sent successfully!' });
      fetchRequests();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send request' });
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);
      setMessage({ type: 'success', text: `Request ${status.toLowerCase()} successfully!` });
      fetchRequests();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update request status' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-slate-200 rounded-xl w-64"></div>
        <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Requests Center</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage your skill exchange proposals</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="gap-2 shadow-lg shadow-primary/20"
          variant={showForm ? 'outline' : 'primary'}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'New Proposal'}
        </Button>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 rounded-xl text-center font-medium shadow-md ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-2 border-primary/20 bg-primary/5 shadow-none">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Collaborator</label>
                    <select
                      className="flex h-12 w-full rounded-xl border-none bg-white px-4 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.receiverId}
                      onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                      required
                    >
                      <option value="">Select User</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>{u.name || u.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Skill to Exchange</label>
                    <Input
                      className="h-12 rounded-xl border-none bg-white px-4 shadow-sm"
                      placeholder="e.g. React.js"
                      value={formData.skillExchange}
                      onChange={(e) => setFormData({ ...formData, skillExchange: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="h-12 rounded-xl font-bold">Send Proposal</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Layout */}
      <div className="space-y-6">
        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'incoming' ? 'bg-white text-primary shadow-sm scale-105' : 'text-muted-foreground hover:text-slate-600'
            }`}
          >
            <Inbox size={16} /> Incoming
            {incoming.length > 0 && <span className="ml-1 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{incoming.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'outgoing' ? 'bg-white text-secondary shadow-sm scale-105' : 'text-muted-foreground hover:text-slate-600'
            }`}
          >
            <Send size={16} /> Outgoing
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="wait">
            {(activeTab === 'incoming' ? incoming : outgoing).length > 0 ? (
              (activeTab === 'incoming' ? incoming : outgoing).map((req, idx) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, x: activeTab === 'incoming' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === 'incoming' ? 20 : -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="group hover:border-slate-300 transition-all border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${
                          activeTab === 'incoming' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                        }`}>
                          {(activeTab === 'incoming' ? req.sender?.name : req.receiver?.name)?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                            {activeTab === 'incoming' ? 'From' : 'To'}
                          </p>
                          <h4 className="font-bold text-slate-800">
                            {activeTab === 'incoming' ? req.sender?.name : req.receiver?.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex-1 px-4">
                         <div className="flex items-center gap-2 text-sm">
                            <BookOpen size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground">Skill Request:</span>
                            <Badge variant="subtle" className="font-bold bg-slate-50 text-slate-700">{req.skillExchange}</Badge>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 min-w-[200px] justify-end">
                        <Badge variant={
                          req.status === 'Accepted' ? 'success' : 
                          req.status === 'Rejected' ? 'destructive' : 
                          'outline'
                        } className="font-bold px-3 py-1">
                          {req.status === 'Pending' && <Clock size={12} className="mr-1.5" />}
                          {req.status}
                        </Badge>

                        {activeTab === 'incoming' && req.status === 'Pending' && (
                          <div className="flex gap-2">
                             <Button size="icon" variant="success" className="rounded-xl h-10 w-10" onClick={() => handleStatusUpdate(req._id, 'Accepted')}>
                               <Check size={18} />
                             </Button>
                             <Button size="icon" variant="destructive" className="rounded-xl h-10 w-10" onClick={() => handleStatusUpdate(req._id, 'Rejected')}>
                               <X size={18} />
                             </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
              >
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  {activeTab === 'incoming' ? <Inbox className="text-slate-300" /> : <Send className="text-slate-300" />}
                </div>
                <div>
                   <h4 className="font-bold text-slate-600">No {activeTab} requests</h4>
                   <p className="text-sm text-muted-foreground">Proposals will appear here once initiated.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RequestsPanel;
