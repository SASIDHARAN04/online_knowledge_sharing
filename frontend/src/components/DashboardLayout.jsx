import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileCard from './ProfileCard';
import MatchCards from './MatchCards';
import RequestsPanel from './RequestsPanel';
import ChatInterface from './ChatInterface';
import NotificationPopover from './NotificationPopover';
import { useSocket } from '../context/SocketContext';
import { 
  User as UserIcon, 
  Search, 
  Inbox, 
  MessageCircle, 
  LogOut, 
  Bell,
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const sections = [
    { id: 'profile', label: 'My Profile', icon: <UserIcon size={18} /> },
    { id: 'matches', label: 'Find Matches', icon: <Search size={18} /> },
    { id: 'requests', label: 'Requests', icon: <Inbox size={18} /> },
    { id: 'chat', label: 'Messages', icon: <MessageCircle size={18} /> }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileCard />;
      case 'matches': return <MatchCards />;
      case 'requests': return <RequestsPanel />;
      case 'chat': return <ChatInterface />;
      default: return <ProfileCard />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-7 mb-10 flex items-center gap-3.5">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 rotate-3 ring-4 ring-primary/10 transition-transform hover:rotate-0 cursor-pointer">
          <Sparkles size={20} />
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-800">SkillExchange</span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <p className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeSection === section.id 
              ? 'bg-primary text-white shadow-xl shadow-primary/25 translate-x-1' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-primary hover:translate-x-1'
            }`}
          >
            <span className={`transition-transform duration-300 ${activeSection === section.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {section.icon}
            </span>
            <span className="font-bold text-sm tracking-tight">{section.label}</span>
            {activeSection === section.id && (
              <motion.div layoutId="active-indicator" className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
            )}
          </button>
        ))}
      </nav>

      <div className="px-4 mt-auto border-t border-slate-100 pt-6">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3.5 text-slate-500 hover:text-destructive hover:bg-red-50 rounded-2xl h-12 transition-all group px-5"
          onClick={logout}
        >
          <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-bold text-sm">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans selection:bg-primary/10 selection:text-primary">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden border-r border-slate-100 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} className="text-slate-600" />
            </Button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                  {sections.find(s => s.id === activeSection)?.label}
                </h1>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 shadow-sm w-fit bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100/50">
                Dashboard V4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            {/* Action Group */}
            <div className="flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100 relative">
              <Button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                variant="ghost" 
                size="icon" 
                className={`h-9 w-9 relative text-slate-500 hover:bg-white hover:text-primary rounded-xl shadow-none transition-all ${isNotificationOpen ? 'bg-white text-primary shadow-sm' : ''}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </Button>
              
              <AnimatePresence>
                {isNotificationOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[90]" 
                      onClick={() => setIsNotificationOpen(false)}
                    />
                    <NotificationPopover 
                      isOpen={isNotificationOpen} 
                      onClose={() => setIsNotificationOpen(false)}
                      onSelectSection={(sectionId) => {
                        setActiveSection(sectionId);
                        setIsNotificationOpen(false);
                      }}
                    />
                  </>
                )}
              </AnimatePresence>

              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-white hover:text-primary rounded-xl shadow-none transition-all">
                <Settings size={18} />
              </Button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-1.5 group cursor-pointer hover:bg-white p-1 rounded-2xl transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] pr-3.5 border border-transparent hover:border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <div className="h-full w-full rounded-[9px] bg-white flex items-center justify-center text-primary font-black text-lg">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none group-hover:text-primary transition-colors">{user?.name || 'User'}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider line-clamp-1">Pro Member</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar relative">
          {/* Subtle Background Decorations */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] -z-10 pointer-events-none opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[140px] -z-10 pointer-events-none opacity-40"></div>

          <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.995 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
