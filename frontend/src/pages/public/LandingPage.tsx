import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building2, Users, CreditCard, Shield, TrendingUp, Home, ArrowRight, Menu, X, Sun, Moon, Star, Check, ChevronRight, Quote, Sparkles, Zap, BarChart3, Globe2, Medal, Phone, Mail, ChevronLeft, Play } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const features = [
  { icon: Building2, title: 'Property Management', description: 'Easily manage all your rental properties from one centralized dashboard with real-time updates and smart insights.' },
  { icon: Users, title: 'Tenant Management', description: 'Streamline tenant onboarding, communication, and lease management with automated workflows and digital agreements.' },
  { icon: CreditCard, title: 'Smart Payments', description: 'Accept rent and other charges via Razorpay with automatic invoice generation, reminders, and reconciliation.' },
  { icon: Shield, title: 'Enterprise Security', description: 'Role-based access control, JWT authentication, and encrypted data storage for maximum security compliance.' },
  { icon: TrendingUp, title: 'Analytics & Insights', description: 'Detailed analytics dashboard with revenue charts, occupancy trends, vacancy reports, and actionable insights.' },
  { icon: Search, title: 'Property Discovery', description: 'Public vacancy search with advanced filters for location, price range, room type, amenities, and virtual tours.' },
];

const stats = [
  { label: 'Properties Managed', value: '500+', suffix: '' },
  { label: 'Happy Tenants', value: '2,000+', suffix: '' },
  { label: 'Cities Covered', value: '25+', suffix: '' },
  { label: 'Monthly Transactions', value: '2', suffix: 'Cr+' },
];

const steps = [
  { number: '01', title: 'Create Account', description: 'Sign up as a property owner or tenant in under 2 minutes with your email or phone.', color: 'from-blue-500 to-cyan-400' },
  { number: '02', title: 'List or Browse', description: 'Owners list properties with detailed info. Tenants browse vacancies with powerful filters.', color: 'from-purple-500 to-pink-400' },
  { number: '03', title: 'Connect & Lease', description: 'Tenants enquire, owners review, and both parties agree on terms digitally.', color: 'from-amber-500 to-orange-400' },
  { number: '04', title: 'Manage & Grow', description: 'Automated rent collection, maintenance tracking, analytics, and portfolio growth tools.', color: 'from-emerald-500 to-teal-400' },
];

const testimonials = [
  { name: 'Rajesh Mehta', role: 'Property Owner, Mumbai', quote: 'Domicilo transformed how I manage my 12 properties. Rent collection used to be a headache — now it\'s fully automated. The analytics alone saved me hours every week.', rating: 5, initials: 'RM' },
  { name: 'Priya Sharma', role: 'Tenant, Bangalore', quote: 'Finding the perfect rental was so easy. I loved the filters, virtual tour support, and how quickly the owner responded through the platform. Highly recommend!', rating: 5, initials: 'PS' },
  { name: 'Amit Verma', role: 'Property Owner, Delhi', quote: 'The lead management system is brilliant. I can track every enquiry, convert them to tenants, and manage all paperwork digitally. My vacancy rate dropped from 30% to 5%.', rating: 5, initials: 'AV' },
  { name: 'Sneha Patel', role: 'Tenant, Pune', quote: 'Paying rent is finally hassle-free. Automatic reminders, multiple payment options, and I can track my payment history. The maintenance request feature is a game-changer.', rating: 5, initials: 'SP' },
];

function Counter({ value, suffix, duration = 2000 }: { value: string; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * numericValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, numericValue, duration]);

  return <div ref={ref}>{count}{suffix.replace('+', '')}<span className="text-primary-400">+</span></div>;
}

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/properties?search=${searchQuery}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-100/50 dark:border-gray-800/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight">Domicilo</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/properties" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group">
                Browse Properties
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
              </Link>
              <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
              </a>
              <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {user ? (
                <button onClick={() => navigate(`/${user.role}/dashboard`)} className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">Dashboard <Zap className="w-3.5 h-3.5" /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Sign In</button>
                  <button onClick={() => navigate('/register')} className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700 active:scale-95 transition-all duration-150">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden mobile-overlay"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-20 left-0 right-0 z-50 md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl mobile-menu-panel"
            >
              <div className="px-4 py-6 space-y-4">
                <Link to="/properties" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 dark:text-gray-300 py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Browse Properties</Link>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 dark:text-gray-300 py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 dark:text-gray-300 py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">How It Works</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-700 dark:text-gray-300 py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Contact</a>
                <div className="flex items-center gap-2 px-3">
                  <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <span className="text-xs text-gray-500">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className="flex gap-3 pt-2 px-3">
                  {user ? (
                    <button onClick={() => { navigate(`/${user.role}/dashboard`); setMobileMenuOpen(false); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold text-center">Dashboard</button>
                  ) : (
                    <>
                      <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold">Sign In</button>
                      <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold">Get Started</button>
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
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-primary-950 to-gray-950" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(14,165,233,0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[128px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/80 text-xs mb-8"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Premium Property Management Platform
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-8"
              >
                Simplify Rental{' '}
                <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                  Management
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-blue-100/90 mb-10 max-w-xl leading-relaxed tracking-wide font-light"
              >
                The all-in-one platform for property owners to manage rentals, track payments, and grow their portfolio. 
                Tenants get a seamless experience with easy payments and real-time updates.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <button onClick={() => navigate('/register')} className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-base hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                <button onClick={() => navigate('/properties')} className="px-8 py-4 rounded-2xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm flex items-center gap-2 group">
                  Browse Properties <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex items-center gap-6 mt-12"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 border-2 border-white dark:border-gray-950 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                      {['RK', 'PS', 'AV', 'SP'][i - 1]}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 border-2 border-white dark:border-gray-950 flex items-center justify-center text-[10px] font-bold text-white">2k+</div>
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-blue-100/80 mt-0.5">Trusted by 2,000+ tenants & owners</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden shadow-2xl shadow-blue-500/10">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <div className="ml-4 flex-1 max-w-[200px] h-5 rounded-md bg-white/5 flex items-center px-3">
                      <span className="text-[10px] text-white/40">domicilo.app</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest">Total Revenue</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          <span className="text-white/40 text-sm font-normal">₹</span>12,84,500
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-medium">+24.5%</span>
                      </div>
                    </div>
                    <div className="h-32 rounded-xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 border border-white/5 p-3">
                      <div className="flex items-end gap-1.5 h-full">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500/60 to-cyan-400/40"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Properties', value: '12', color: 'from-blue-500/20 to-blue-400/10' },
                        { label: 'Occupied', value: '89%', color: 'from-emerald-500/20 to-emerald-400/10' },
                        { label: 'Revenue', value: '₹2.4L', color: 'from-purple-500/20 to-purple-400/10' },
                      ].map((item) => (
                        <div key={item.label} className={`rounded-lg bg-gradient-to-br ${item.color} border border-white/5 p-3 text-center`}>
                          <p className="text-white/50 text-[10px] uppercase">{item.label}</p>
                          <p className="text-white font-bold text-sm mt-0.5">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Payment Verified</p>
                      <p className="text-xs text-gray-500">Rent received successfully</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-2xl p-3"
                >
                  <div className="text-white text-center">
                    <p className="text-lg font-bold">99.9%</p>
                    <p className="text-[10px] text-white/80">Uptime</p>
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-10 shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 md:py-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powerful Features
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">manage rentals</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Powerful tools for property owners and a seamless experience for tenants — all in one platform.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
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
                variants={itemVariants}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:border-primary-200/50 dark:hover:border-primary-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-primary-400/10 dark:to-accent-400/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed tracking-wide">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 md:py-36 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Simple Process
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
              How it{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Get started in minutes. No complex setup, no hidden costs.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500/30 via-accent-500/30 to-transparent hidden lg:block" />
            <div className="space-y-12 lg:space-y-0">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right' : 'lg:text-left'} text-center`}>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${step.color} bg-opacity-10 text-white text-xs font-medium mb-4`}>
                      Step {step.number}
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md leading-relaxed tracking-wide mx-auto lg:mx-0">{step.description}</p>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {step.number}
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-3xl blur-md -z-10" />
                  </div>
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 md:py-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950 border border-primary-100 dark:border-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium mb-6">
            <Quote className="w-3.5 h-3.5" />
            Testimonials
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
            What our{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Users</span> Say
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Real feedback from property owners and tenants who use Domicilo every day.
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-10 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-light italic tracking-wide">
                &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                  {testimonials[activeTestimonial].initials}
                </div>
                <div>
                  <p className="font-display font-semibold text-gray-900 dark:text-white tracking-tight">{testimonials[activeTestimonial].name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
              className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-gray-700 dark:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-6 bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
              className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-gray-700 dark:text-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-28 md:py-36 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto relative"
        >
          <div className="absolute -inset-6 bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-purple-500/20 rounded-[40px] blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-gray-950 via-primary-950 to-gray-950 p-10 md:p-16 lg:p-20 border border-white/5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-[100px]" />

            <div className="relative text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium mb-8">
                <Medal className="w-3.5 h-3.5 text-yellow-400" />
                Start Your Journey Today
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                Ready to transform your{' '}
                <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent">rental management</span>?
              </h2>
              <p className="text-blue-100/90 mb-10 max-w-xl mx-auto text-lg leading-relaxed tracking-wide">
                Join thousands of property owners and tenants already using Domicilo. Get started free, no credit card required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => navigate('/register')} className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-base hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                <a href="tel:+919999999999" className="px-10 py-4 rounded-2xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm flex items-center gap-2 group">
                  <Phone className="w-4 h-4" /> Talk to Sales
                </a>
              </div>
              <div className="flex items-center justify-center gap-8 mt-10 text-blue-200/70 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> No credit card
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Free setup
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
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">Domicilo</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Premium property rental management platform. Making rental management effortless for owners and tenants alike.
              </p>
              <div className="flex items-center gap-3">
                <a href="mailto:support@domicilo.com" className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="tel:+919999999999" className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Platform</h4>
              <div className="space-y-3">
                <Link to="/properties" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Browse Properties</Link>
                <Link to="/register" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">List Property</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Company</h4>
              <div className="space-y-3">
                <Link to="/about" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">About Us</Link>
                <a href="#contact" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
                <Link to="/privacy" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Support</h4>
              <div className="space-y-3">
                <a href="mailto:support@domicilo.com" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> support@domicilo.com
                </a>
                <a href="tel:+919999999999" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> +91 99999 99999
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Domicilo. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
