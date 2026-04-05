import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const LoginPage = () => {
  console.log('LoginPage: Rendering...');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skillsOffered: [],
    skillsWanted: [],
    experienceLevel: 'Beginner'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Verification failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected server error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <Card className="border-none shadow-2xl glass overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
          
          <CardHeader className="text-center pt-10 pb-6">
             <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20 mb-6 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <Sparkles size={32} />
             </div>
             <CardTitle className="text-3xl font-black text-slate-800 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
             </CardTitle>
             <p className="text-muted-foreground mt-2 font-medium">
                {isLogin ? 'Continue your learning journey today.' : 'Join the world\'s largest skill exchange network.'}
             </p>
          </CardHeader>

          <CardContent className="px-10 pb-10">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => { setIsLogin(true); setError(''); }}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => { setIsLogin(false); setError(''); }}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
               {error && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3"
                 >
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                    {error}
                 </motion.div>
               )}
            </AnimatePresence>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    className="pl-10 h-12 bg-white/50 border-slate-200 rounded-xl focus-visible:ring-primary/20"
                    placeholder="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  className="pl-10 h-12 bg-white/50 border-slate-200 rounded-xl focus-visible:ring-primary/20"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  className="pl-10 h-12 bg-white/50 border-slate-200 rounded-xl focus-visible:ring-primary/20"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {isLogin && (
                <div className="flex justify-end">
                   <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot password?</button>
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2 text-md shadow-lg shadow-primary/20 mt-4" disabled={loading}>
                {loading ? 'Authenticating...' : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50/50 p-6 flex items-center justify-center gap-2 border-t border-slate-100">
             <ShieldCheck size={16} className="text-green-500" />
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secure 256-bit SSL Encryption</span>
          </CardFooter>
        </Card>

        <p className="text-center mt-8 text-slate-500 text-sm font-medium">
           Don't have an account? <button onClick={() => setIsLogin(false)} className="text-primary font-bold hover:underline">Sign up for free</button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
