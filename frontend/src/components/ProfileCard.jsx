import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Award, BookOpen, Plus, X, Save, Edit3 } from 'lucide-react';

const ProfileCard = () => {
  const { user, refreshProfile, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    experienceLevel: user?.experienceLevel || 'Intermediate'
  });

  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        experienceLevel: user.experienceLevel || 'Intermediate'
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (type, skill) => {
    const trimmedSkill = skill.trim().toLowerCase();
    if (!trimmedSkill) return;
    
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    if (!formData[key].includes(trimmedSkill)) {
      const newSkills = [...formData[key], trimmedSkill];
      const newFormData = { ...formData, [key]: newSkills };
      setFormData(newFormData);
      // Auto-save on adding skill if not in full edit mode? 
      // Let's keep it manual for now to follow the Save button pattern.
    }
    
    if (type === 'offered') setNewSkillOffered('');
    else setNewSkillWanted('');
  };

  const removeSkill = (type, skill) => {
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    setFormData({
      ...formData,
      [key]: formData[key].filter(s => s !== skill)
    });
  };

  if (!isAuthenticated || !user) {
    return <div className="text-center p-20 glass rounded-2xl">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-xl text-center font-medium shadow-lg ${
              message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden border-none shadow-xl">
        {/* Profile Header Background */}
        <div className="h-32 bg-gradient-to-r from-primary to-secondary relative">
          <div className="absolute -bottom-12 left-8">
             <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg border-4 border-white overflow-hidden">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-primary">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
             </div>
          </div>
          <div className="absolute bottom-4 right-8">
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="gap-2 bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30">
                <Edit3 size={18} />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <CardContent className="pt-16 px-8 pb-8">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <User size={16} className="text-primary" /> Name
                  </label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Award size={16} className="text-secondary" /> Experience Level
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Bio</label>
                <textarea 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself and your skills..."
                />
              </div>

              {/* Skill Editing Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <SkillEditSection 
                  title="Skills I Can Teach" 
                  icon={<Award className="text-primary" />}
                  skills={formData.skillsOffered}
                  inputValue={newSkillOffered}
                  setInputValue={setNewSkillOffered}
                  onAdd={() => addSkill('offered', newSkillOffered)}
                  onRemove={(s) => removeSkill('offered', s)}
                  variant="primary"
                />
                <SkillEditSection 
                  title="Skills I Want to Learn" 
                  icon={<BookOpen className="text-secondary" />}
                  skills={formData.skillsWanted}
                  inputValue={newSkillWanted}
                  setInputValue={setNewSkillWanted}
                  onAdd={() => addSkill('wanted', newSkillWanted)}
                  onRemove={(s) => removeSkill('wanted', s)}
                  variant="secondary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" className="gap-2" disabled={loading}>
                  {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{user?.name}</h1>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Mail size={14} /> {user?.email}
                  </p>
                </div>
                <Badge variant="success" className="px-3 py-1 bg-green-100 text-green-700">
                  {user?.experienceLevel || 'Intermediate'}
                </Badge>
              </div>

              {user?.bio && (
                <div className="bg-muted/30 p-4 rounded-xl border border-muted italic">
                  <p className="text-slate-600 dark:text-slate-400">"{user.bio}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SkillDisplaySection 
                  title="Expertise" 
                  skills={user?.skillsOffered} 
                  variant="primary" 
                />
                <SkillDisplaySection 
                  title="Interests" 
                  skills={user?.skillsWanted} 
                  variant="secondary" 
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SkillEditSection = ({ title, icon, skills, inputValue, setInputValue, onAdd, onRemove, variant }) => (
  <div className="space-y-4">
    <label className="text-sm font-bold flex items-center gap-2">
      {icon} {title}
    </label>
    <div className="flex gap-2">
      <Input 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        placeholder="Add a skill..."
      />
      <Button type="button" size="icon" onClick={onAdd} variant={variant}>
        <Plus size={20} />
      </Button>
    </div>
    <div className="flex flex-wrap gap-2 mt-2">
      <AnimatePresence>
        {skills.map(skill => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Badge variant={variant} className="gap-1 pl-3 pr-1 py-1">
              {skill}
              <button onClick={() => onRemove(skill)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                <X size={12} />
              </button>
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

const SkillDisplaySection = ({ title, skills, variant }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {skills?.length > 0 ? (
        skills.map(skill => (
          <Badge key={skill} variant={variant} className="px-3 py-1.5 text-sm font-medium transition-transform hover:scale-105">
            {skill}
          </Badge>
        ))
      ) : (
        <p className="text-sm text-muted-foreground italic">No skills listed</p>
      )}
    </div>
  </div>
);

export default ProfileCard;
