import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Building2, Users, CreditCard, Shield, TrendingUp, Home,
  ArrowRight, Star, Check, Sparkles,
  Zap, BarChart3, Globe2, Medal, Phone, Mail, Crown, Gem,
  Infinity as InfinityIcon, Diamond, Compass, LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const features = [
  { icon: Crown, title: 'Premium Portfolio Management', description: 'See all your properties in one place. Check who paid rent, who hasn\'t, and how much money you made.' },
  { icon: Gem, title: 'Smart Tenant Relations', description: 'Talk to your tenants easily. Send messages, manage papers, and keep everything organized.' },
  { icon: Diamond, title: 'Payments & Reconciliation', description: 'Collect rent automatically. No more chasing tenants. Get paid on time, every time.' },
  { icon: Shield, title: 'Enterprise Security', description: 'Your data is safe with us. Only you and your tenants can see what matters.' },
  { icon: Compass, title: 'Advanced Analytics', description: 'See charts showing your earnings, empty rooms, and future trends at a glance.' },
  { icon: InfinityIcon, title: 'Property Discovery', description: 'Search for homes by city, price, and room type. Find the perfect match fast.' },
];

const stats = [
  { label: 'Properties Listed', value: '500+', suffix: '' },
  { label: 'Active Users', value: '2,000+', suffix: '' },
  { label: 'Cities Covered', value: '25+', suffix: '' },
  { label: 'Monthly Volume', value: '2', suffix: 'Cr+' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

function Counter({ value, suffix, duration = 2500 }: { value: string; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, numericValue, duration]);

  return <div ref={ref}>{count}{suffix}<span className="text-gold-400">+</span></div>;
}

function FloatingOrb({ className, size, color, delay }: { className?: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{ width: size, height: size, background: color }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.15, 0.3, 0.15],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' as const }}
    />
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/properties?search=${searchQuery}`);
  };

  return (
    <div className="relative">
      {/* Floating Orbs */}
      <FloatingOrb className="fixed top-1/4 left-[10%] pointer-events-none" size={300} color="radial-gradient(circle, rgba(139,92,246,0.12), transparent)" delay={0} />
      <FloatingOrb className="fixed bottom-1/3 right-[15%] pointer-events-none" size={250} color="radial-gradient(circle, rgba(212,168,83,0.1), transparent)" delay={1.5} />
      <FloatingOrb className="fixed top-2/3 left-[60%] pointer-events-none" size={200} color="radial-gradient(circle, rgba(168,85,247,0.08), transparent)" delay={3} />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' as const }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4 rounded-3xl bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-2xl shadow-black/5 dark:shadow-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center shadow-xl shadow-royal-500/30 group-hover:shadow-royal-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Crown className="w-6 h-6 text-gold-400" />
                </div>
                <span className="font-display font-bold text-2xl text-gray-900 dark:text-white tracking-tight">Domicilo</span>
              </Link>

              <div className="hidden md:flex items-center gap-10">
                <Link to="/properties"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group tracking-wide"
                >
                  Browse Properties
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-royal-500 to-gold-500 group-hover:w-full transition-all duration-500" />
                </Link>
                {[
                  { label: 'Features', id: 'features' },
                  { label: 'Contact', id: 'contact' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.id)}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group tracking-wide"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-royal-500 to-gold-500 group-hover:w-full transition-all duration-500" />
                  </button>
                ))}
                {user ? (
                  <button onClick={() => navigate(`/${user.role}/dashboard`)}
                    className="relative px-7 py-2.5 rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white text-sm font-semibold hover:shadow-2xl hover:shadow-royal-500/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group border border-royal-400/20">
                    <span className="relative z-10 flex items-center gap-2"><LayoutDashboard className="w-3.5 h-3.5 text-gold-400" /> Dashboard</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">Sign In</button>
                    <button onClick={() => navigate('/register')}
                      className="relative px-7 py-2.5 rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white text-sm font-semibold hover:shadow-2xl hover:shadow-royal-500/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group border border-royal-400/20">
                      <span className="relative z-10 flex items-center gap-2">Get Started <Sparkles className="w-3.5 h-3.5 text-gold-400" /></span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-royal-500/10 rounded-full blur-[150px] z-[1]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-gold-500/8 rounded-full blur-[150px] z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' as const }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 text-xs mb-10"
              >
                <Crown className="w-4 h-4 text-gold-400" />
                <span className="tracking-widest uppercase font-medium">Premium Property Management</span>
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse-glow" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.0] tracking-tight mb-8"
              >
                Elevate Your{' '}
                <span className="gradient-text-gold">
                  Portfolio
                </span>
                <br />
                With{' '}
                <span className="gradient-text">
                  Precision
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg md:text-xl text-white/70 max-w-xl mb-12 leading-relaxed font-light tracking-wide"
              >
                Experience a new standard in property management. Smart tools for 
                landlords, seamless experiences for tenants, and real-time insights 
                that help you make better decisions — all in one premium platform.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <button onClick={() => navigate('/register')}
                  className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-royal-600 via-royal-700 to-royal-800 text-white font-semibold text-base hover:shadow-2xl hover:shadow-royal-500/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-royal-400/20">
                  <span className="relative z-10 flex items-center gap-3">
                    Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-royal-700 to-royal-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
                <button onClick={() => navigate('/properties')}
                  className="px-10 py-5 rounded-2xl border border-white/15 text-white/90 font-medium hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm flex items-center gap-3 group">
                  Browse Properties <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex items-center gap-6 mt-14"
              >
                <div className="flex -space-x-3">
                  {['RK', 'PS', 'AV', 'SP'].map((initials, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                    >
                      {initials}
                    </motion.div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-royal-950 shadow-lg">2k+</div>
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-gold-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">Beloved by 2,000+ nobles</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: 'easeOut' as const }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-royal-500/20 via-gold-500/20 to-royal-500/20 rounded-[40px] blur-3xl" />
                <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl shadow-royal-500/10">
                  <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-gold-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    <div className="ml-4 flex-1 max-w-[180px] h-6 rounded-xl bg-white/5 flex items-center px-3 border border-white/5">
                      <span className="text-[10px] text-white/30 tracking-wider">domicilo.app</span>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                          <span className="text-white/30 text-sm font-normal">₹</span>12,84,500
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-semibold">+24.5%</span>
                      </div>
                    </div>
                    <div className="h-36 rounded-2xl bg-gradient-to-br from-royal-500/5 via-gold-500/5 to-royal-500/5 border border-white/5 p-4">
                      <div className="flex items-end gap-2 h-full">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.8 + i * 0.06, duration: 0.8, ease: 'easeOut' as const }}
                            className="flex-1 rounded-lg bg-gradient-to-t from-royal-500/60 via-royal-400/40 to-gold-500/20"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Properties', value: '12', color: 'from-royal-500/20 to-royal-400/10' },
                        { label: 'Occupied', value: '89%', color: 'from-emerald-500/20 to-emerald-400/10' },
                        { label: 'Revenue', value: '₹2.4L', color: 'from-gold-500/20 to-gold-400/10' },
                      ].map((item) => (
                        <div key={item.label} className={`rounded-2xl bg-gradient-to-br ${item.color} border border-white/5 p-4 text-center`}>
                          <p className="text-white/40 text-[10px] uppercase tracking-widest">{item.label}</p>
                          <p className="text-white font-bold text-lg mt-1">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  className="absolute -bottom-8 -left-8 rounded-2xl bg-white/80 dark:bg-black/60 backdrop-blur-2xl shadow-2xl p-5 border border-white/30 dark:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Payment Received</p>
                      <p className="text-xs text-gray-500">Rent collected automatically</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.7, duration: 0.6 }}
                  className="absolute -top-6 -right-6 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 shadow-2xl p-4"
                >
                  <div className="text-white text-center">
                    <p className="text-xl font-bold tracking-tight">99.9%</p>
                    <p className="text-[10px] text-white/70 uppercase tracking-wider">Platform Uptime</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 -mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-royal-500/20 via-gold-500/20 to-royal-500/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-bold gradient-text-gold">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 md:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-royal-500/10 border border-royal-500/15 text-royal-400 text-xs font-semibold mb-6 uppercase tracking-widest">
            <Gem className="w-3.5 h-3.5" />
            Premium Features
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
            Everything You Need to{' '}
            <span className="gradient-text-gold">Manage Properties</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed tracking-wide">
            Powerful tools designed to help you manage, grow, and streamline your property portfolio with confidence.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-royal-500/20 via-gold-500/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative h-full rounded-3xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 p-8 hover:border-royal-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-royal-500/10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-500/10 to-gold-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                    <Icon className="w-8 h-8 text-royal-400" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-28 md:py-40 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto relative"
        >
          <div className="absolute -inset-8 bg-gradient-to-r from-royal-500/20 via-gold-500/20 to-royal-500/20 rounded-[48px] blur-3xl" />
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-royal-950 via-royal-900 to-royal-950 p-10 md:p-16 lg:p-20 border border-royal-400/10 shadow-2xl shadow-royal-500/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-royal-500/15 rounded-full blur-[120px]" />

            <div className="relative text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 text-xs font-semibold mb-10 uppercase tracking-widest">
                <Crown className="w-4 h-4 text-gold-400" />
                Your Coronation Awaits
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                Ready to{' '}
                <span className="gradient-text-gold">Get Started</span>?
              </h2>
              <p className="text-white/60 mb-12 max-w-2xl mx-auto text-lg leading-relaxed tracking-wide">
                Join thousands of property owners and tenants already using Domicilo. 
                No hidden fees. No commitments. Your journey starts here.
              </p>
              <div className="flex flex-wrap justify-center gap-5">
                <button onClick={() => navigate('/register')}
                  className="group relative px-12 py-5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-700 text-royal-950 font-bold text-base hover:shadow-2xl hover:shadow-gold-500/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    Get Started Now <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
                <a href="tel:+919999999999"
                  className="px-12 py-5 rounded-2xl border border-white/15 text-white font-medium hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm flex items-center gap-3 group">
                  <Phone className="w-5 h-5" /> Contact Us
                </a>
              </div>
              <div className="flex items-center justify-center gap-8 mt-12 text-white/50 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> No hidden fees
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Free to get started
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center shadow-xl shadow-royal-500/20">
                  <Crown className="w-6 h-6 text-gold-400" />
                </div>
                <span className="font-bold text-xl text-white">Domicilo</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
                The premium platform for property rental management. Built for modern landlords and tenants.
              </p>
              <div className="flex items-center gap-3">
                <a href="mailto:support@domicilo.com" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-500/30 transition-all hover:bg-gold-500/5">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="tel:+919999999999" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-500/30 transition-all hover:bg-gold-500/5">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {[
              { title: 'Platform', links: [
                { label: 'Browse Properties', to: '/properties' },
                { label: 'List Your Property', to: '/register' },
              ]},
              { title: 'Company', links: [
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '#contact' },
                { label: 'Privacy Policy', to: '/privacy' },
              ]},
              { title: 'Support', links: [
                { label: 'support@domicilo.com', to: 'mailto:support@domicilo.com', icon: Mail },
                { label: '+91 99999 99999', to: 'tel:+919999999999', icon: Phone },
              ]},
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white mb-6 text-xs uppercase tracking-[0.2em]">{col.title}</h4>
                <div className="space-y-4">
                  {col.links.map((link) => {
                    const Icon = (link as any).icon;
                    const isExternal = link.to.startsWith('mailto:') || link.to.startsWith('tel:');
                    return (
                      <Link key={link.label} to={link.to}
                        onClick={(e) => {
                          if (link.to.startsWith('#')) e.preventDefault();
                        }}
                        className="block text-sm text-gray-400 hover:text-gold-400 transition-colors flex items-center gap-2">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Domicilo. All rights reserved.</p>
            <div className="flex items-center gap-8 text-xs text-gray-500">
              <Link to="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
