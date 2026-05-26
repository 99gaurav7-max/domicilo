import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Building2, Users, CreditCard, Shield, TrendingUp, Home,
  ArrowRight, Menu, X, Sun, Moon, Star, Check, ChevronRight, Quote, Sparkles,
  Zap, BarChart3, Globe2, Medal, Phone, Mail, ChevronLeft, Crown, Gem,
  Infinity as InfinityIcon, Feather, Heart, Diamond, Compass
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const features = [
  { icon: Crown, title: 'Royal Portfolio Management', description: 'Command your properties like a monarch. Centralized dashboard with real-time intelligence, occupancy foresight, and portfolio-wide analytics at a glance.' },
  { icon: Gem, title: 'Concierge Tenant Relations', description: 'White-glove tenant onboarding, digital lease management, and VIP communication channels that elevate every interaction.' },
  { icon: Diamond, title: 'Treasury & Payments', description: 'Automated rent collection via Razorpay with instant reconciliation, royal invoice generation, and smart payment reminders.' },
  { icon: Shield, title: 'Fortress Security', description: 'Bank-grade encryption, role-based citadel access, and JWT authentication — your kingdom, securely guarded.' },
  { icon: Compass, title: 'Oracle Analytics', description: 'Crystal-ball insights with revenue prophecies, occupancy trends, vacancy forecasts, and portfolio growth maps.' },
  { icon: InfinityIcon, title: 'Endless Discovery', description: 'Public property gallery with celestial filters — location, price, room type, amenities. Find your perfect realm.' },
];

const stats = [
  { label: 'Properties Enthroned', value: '500+', suffix: '' },
  { label: 'Happy Subjects', value: '2,000+', suffix: '' },
  { label: 'Kingdoms Covered', value: '25+', suffix: '' },
  { label: 'Monthly Treasury', value: '2', suffix: 'Cr+' },
];

const steps = [
  { number: 'I', title: 'Claim Your Throne', description: 'Ascend as an owner or tenant in moments. A royal welcome awaits.', ornament: '👑' },
  { number: 'II', title: 'Reveal Your Realm', description: 'Owners decree their estates. Tenants discover their dream domain.', ornament: '🏰' },
  { number: 'III', title: 'Forge the Pact', description: 'Tenants send their decree, owners bestow approval. The covenant is sealed.', ornament: '📜' },
  { number: 'IV', title: 'Reign Supreme', description: 'Automated tributes, celestial maintenance tracking, and oracular growth tools.', ornament: '✨' },
];

const testimonials = [
  { name: 'Rajesh Mehta', role: 'Property Magnate, Mumbai', quote: 'Domicilo transformed my 12-property empire. Rent collection was once a peasant\'s chore — now it flows like a royal treasury. The analytics alone saved me a kingdom\'s ransom in hours.', rating: 5, initials: 'RM' },
  { name: 'Priya Sharma', role: 'Tenant, Bangalore', quote: 'Finding my perfect castle was pure enchantment. The filters, the swift royal decree from the owner — every moment felt like a fairy tale. I bow to this platform.', rating: 5, initials: 'PS' },
  { name: 'Amit Verma', role: 'Property Baron, Delhi', quote: 'The lead management is nothing short of wizardry. Every enquiry is an audience, every conversion a coronation. My vacancy collapsed from 30% to 5%. Long live Domicilo!', rating: 5, initials: 'AV' },
  { name: 'Sneha Patel', role: 'Tenant, Pune', quote: 'Paying rent is now a ceremony. Automatic courtly reminders, multiple tribute options, and a history etched in gold. The maintenance request feature? Absolutely divine.', rating: 5, initials: 'SP' },
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
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/properties?search=${searchQuery}`);
  };

  return (
    <div className="relative">
      {/* Floating Orbs */}
      <FloatingOrb className="fixed top-1/4 left-[10%]" size={300} color="radial-gradient(circle, rgba(139,92,246,0.12), transparent)" delay={0} />
      <FloatingOrb className="fixed bottom-1/3 right-[15%]" size={250} color="radial-gradient(circle, rgba(212,168,83,0.1), transparent)" delay={1.5} />
      <FloatingOrb className="fixed top-2/3 left-[60%]" size={200} color="radial-gradient(circle, rgba(168,85,247,0.08), transparent)" delay={3} />

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
                {[
                  { label: 'Browse Estates', href: '/properties' },
                  { label: 'Royal Features', href: '#features' },
                  { label: 'The Path', href: '#how-it-works' },
                  { label: 'Royal Court', href: '#contact' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group tracking-wide"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-royal-500 to-gold-500 group-hover:w-full transition-all duration-500" />
                  </Link>
                ))}
                <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-500 dark:text-gray-400">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4" />}
                </button>
                {user ? (
                  <button onClick={() => navigate(`/${user.role}/dashboard`)}
                    className="relative px-7 py-2.5 rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white text-sm font-semibold hover:shadow-2xl hover:shadow-royal-500/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group border border-royal-400/20">
                    <span className="relative z-10 flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-gold-400" /> My Kingdom</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">Sign In</button>
                    <button onClick={() => navigate('/register')}
                      className="relative px-7 py-2.5 rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white text-sm font-semibold hover:shadow-2xl hover:shadow-royal-500/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group border border-royal-400/20">
                      <span className="relative z-10 flex items-center gap-2">Ascend <Sparkles className="w-3.5 h-3.5 text-gold-400" /></span>
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 active:scale-95 transition-all">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' as const }}
              className="fixed top-24 left-4 right-4 z-50 md:hidden rounded-3xl bg-white/90 dark:bg-black/80 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/20 overflow-hidden"
            >
              <div className="px-6 py-8 space-y-3">
                {[
                  { label: 'Browse Estates', href: '/properties' },
                  { label: 'Royal Features', href: '#features' },
                  { label: 'The Path', href: '#how-it-works' },
                  { label: 'Royal Court', href: '#contact' },
                ].map((item) => (
                  <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)}
                    className="block text-base text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl hover:bg-royal-500/5 transition-colors font-medium">
                    {item.label}
                  </Link>
                ))}
                <div className="flex items-center gap-3 px-4 pt-2">
                  <button onClick={toggleTheme} className="p-2.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <span className="text-xs text-gray-400">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className="flex gap-3 pt-2 px-4">
                  {user ? (
                    <button onClick={() => { navigate(`/${user.role}/dashboard`); setMobileMenuOpen(false); }}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white text-sm font-semibold border border-royal-400/20">
                      My Kingdom
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                        className="flex-1 py-3.5 rounded-2xl border border-white/20 text-gray-700 dark:text-gray-300 text-sm font-semibold">Sign In</button>
                      <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                        className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white text-sm font-semibold border border-royal-400/20">Ascend</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                <span className="tracking-widest uppercase font-medium">The Pinnacle of Property Management</span>
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse-glow" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.0] tracking-tight mb-8"
              >
                Where{' '}
                <span className="gradient-text-gold">
                  Royalty
                </span>
                <br />
                Meets{' '}
                <span className="gradient-text">
                  Real Estate
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg md:text-xl text-white/70 max-w-xl mb-12 leading-relaxed font-light tracking-wide"
              >
                Ascend to a realm where property management becomes an art of kings. 
                Command your estates with celestial intelligence, collect tributes with grace, 
                and build an empire that echoes through eternity.
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
                    Claim Your Kingdom <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-royal-700 to-royal-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
                <button onClick={() => navigate('/properties')}
                  className="px-10 py-5 rounded-2xl border border-white/15 text-white/90 font-medium hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm flex items-center gap-3 group">
                  Explore Estates <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
                        <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">Royal Treasury</p>
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
                        { label: 'Estates', value: '12', color: 'from-royal-500/20 to-royal-400/10' },
                        { label: 'Occupied', value: '89%', color: 'from-emerald-500/20 to-emerald-400/10' },
                        { label: 'Tribute', value: '₹2.4L', color: 'from-gold-500/20 to-gold-400/10' },
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
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Tribute Received</p>
                      <p className="text-xs text-gray-500">Rent collected with grace</p>
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
                    <p className="text-[10px] text-white/70 uppercase tracking-wider">Celestial Uptime</p>
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
            Royal Prerogatives
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
            Sovereign Tools for{' '}
            <span className="gradient-text-gold">Noble Estates</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed tracking-wide">
            Every instrument a monarch needs to govern their realm with wisdom, grace, and absolute command.
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

      {/* How It Works */}
      <section id="how-it-works" className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-royal-500/10 border border-royal-500/15 text-royal-400 text-xs font-semibold mb-6 uppercase tracking-widest">
              <Feather className="w-3.5 h-3.5" />
              The Sacred Path
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
              Your Coronation{' '}
              <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed tracking-wide">
              Four sacred steps to claim your throne in the realm of Domicilo.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-royal-500/20 via-gold-500/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative rounded-3xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 p-8 text-center hover:border-royal-500/20 transition-all duration-500 h-full">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-royal-500/20 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-3xl">{step.ornament}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/10 text-royal-400 text-[10px] font-semibold mb-4 uppercase tracking-widest">
                    Step {step.number}
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-royal-400/30">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 md:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-royal-500/10 border border-royal-500/15 text-royal-400 text-xs font-semibold mb-6 uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5" />
            Words of the Court
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
            What the{' '}
            <span className="gradient-text-gold">Nobility</span> Says
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed tracking-wide">
            Testimonies from the esteemed members of our royal community.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-royal-500/20 via-gold-500/20 to-royal-500/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-2xl p-10 md:p-14">
                <Quote className="w-10 h-10 text-royal-400/30 mb-6" />
                <div className="flex items-center gap-1.5 mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed mb-10 font-light italic tracking-wide font-display">
                  &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonials[activeTestimonial].initials}
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg text-gray-900 dark:text-white tracking-tight">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mt-10">
            <button onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
              className="p-3.5 rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/5 hover:border-royal-500/30 transition-all text-gray-600 dark:text-gray-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`rounded-full transition-all duration-500 ${i === activeTestimonial ? 'w-8 h-2.5 bg-gradient-to-r from-royal-500 to-gold-500' : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'}`} />
              ))}
            </div>
            <button onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
              className="p-3.5 rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/5 hover:border-royal-500/30 transition-all text-gray-600 dark:text-gray-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
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
                Ready to Claim Your{' '}
                <span className="gradient-text-gold">Throne</span>?
              </h2>
              <p className="text-white/60 mb-12 max-w-2xl mx-auto text-lg leading-relaxed tracking-wide">
                Join the royal court of property visionaries who have already ascended. 
                No tribute required. No bond required. Your kingdom awaits.
              </p>
              <div className="flex flex-wrap justify-center gap-5">
                <button onClick={() => navigate('/register')}
                  className="group relative px-12 py-5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-700 text-royal-950 font-bold text-base hover:shadow-2xl hover:shadow-gold-500/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    Ascend Now <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
                <a href="tel:+919999999999"
                  className="px-12 py-5 rounded-2xl border border-white/15 text-white font-medium hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm flex items-center gap-3 group">
                  <Phone className="w-5 h-5" /> Speak to the Court
                </a>
              </div>
              <div className="flex items-center justify-center gap-8 mt-12 text-white/50 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> No tribute required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Free enthronement
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Abdicate anytime
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
                The pinnacle of property rental management. Where royalty meets real estate.
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
              { title: 'The Realm', links: [
                { label: 'Browse Estates', to: '/properties' },
                { label: 'List Your Kingdom', to: '/register' },
              ]},
              { title: 'The Crown', links: [
                { label: 'About Us', to: '/about' },
                { label: 'Royal Court', to: '#contact' },
                { label: 'Sacred Decree', to: '/privacy' },
              ]},
              { title: 'Royal Dispatch', links: [
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
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Domicilo. All rights reserved. By royal decree.</p>
            <div className="flex items-center gap-8 text-xs text-gray-500">
              <Link to="/privacy" className="hover:text-gold-400 transition-colors">Sacred Decree</Link>
              <Link to="/terms" className="hover:text-gold-400 transition-colors">Royal Edicts</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
