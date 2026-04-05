import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Shield, Zap, Users, Globe, Video, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass scroll-py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <span className="text-xl font-bold tracking-tight text-primary">SkillExchange</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</a>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 inline-block">
              Redefining collaborative learning
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Learn <span className="text-primary italic">Anything.</span><br />
              Teach <span className="text-secondary italic">Everything.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join a global community of experts and learners. Exchange your skills live via video calls, messaging, and mutual growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-10">
                  Start Your Journey
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-10">
                  Explore Skills
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
            <p className="text-muted-foreground">The ultimate platform for peer-to-peer knowledge sharing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-primary" />}
              title="Skill Matching"
              description="Our smart algorithm connects you with users who teach what you want to learn."
            />
            <FeatureCard
              icon={<Video className="w-8 h-8 text-secondary" />}
              title="Live Video Learning"
              description="High-quality P2P video calls for real-time demonstrations and direct feedback."
            />
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8 text-accent" />}
              title="Real-time Chat"
              description="Keep the conversation going with our integrated messaging system."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Skills Shared</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50k+</div>
              <div className="text-sm text-muted-foreground">Sessions Held</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="text-lg font-bold text-primary">SkillExchange</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            &copy; 2026 SkillExchange Platform. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
             <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy</a>
             <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms</a>
             <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Card className="hover:border-primary/50 transition-colors">
    <CardContent className="pt-8 text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default LandingPage;
