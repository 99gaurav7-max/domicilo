import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, Users, CreditCard, Shield, TrendingUp, Home, ArrowRight, Menu, X, Sun, Moon, Star } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const features = [
  { icon: Building2, title: 'Property Management', description: 'Easily manage all your rental properties from one centralized dashboard with real-time updates.' },
  { icon: Users, title: 'Tenant Management', description: 'Streamline tenant onboarding, communication, and lease management with automated workflows.' },
  { icon: CreditCard, title: 'Smart Payments', description: 'Accept rent and other charges via Razorpay with automatic invoice generation and reminders.' },
  { icon: Shield, title: 'Secure Platform', description: 'Role-based access control, JWT authentication, and encrypted data storage for maximum security.' },
  { icon: TrendingUp, title: 'Analytics & Insights', description: 'Detailed analytics dashboard with revenue charts, occupancy trends, and actionable insights.' },
  { icon: Search, title: 'Property Discovery', description: 'Public vacancy search with filters for location, price, room type, and amenities.' },
];

const stats = [
  { label: 'Properties Managed', value: '500+' },
  { label: 'Happy Tenants', value: '2,000+' },
  { label: 'Cities Covered', value: '25+' },
  { label: 'Monthly Transactions', value: '₹2Cr+' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/properties?search=${searchQuery}`);
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">Domicilo</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/properties" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Browse Properties</Link>
              <Link to="/about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
              <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {user ? (
                <button onClick={() => navigate(`/${user.role}/dashboard`)} className="btn-primary text-sm">
                  Dashboard
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate('/login')} className="btn-secondary text-sm">Sign In</button>
                  <button onClick={() => navigate('/register')} className="btn-primary text-sm">Get Started</button>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="px-4 py-4 space-y-3">
              <Link to="/properties" className="block text-sm text-gray-600 dark:text-gray-300 py-2">Browse Properties</Link>
              <Link to="/about" className="block text-sm text-gray-600 dark:text-gray-300 py-2">About</Link>
              <Link to="/contact" className="block text-sm text-gray-600 dark:text-gray-300 py-2">Contact</Link>
              <div className="flex gap-2 pt-2">
                {user ? (
                  <button onClick={() => navigate(`/${user.role}/dashboard`)} className="btn-primary text-sm flex-1 text-center">Dashboard</button>
                ) : (
                  <>
                    <button onClick={() => navigate('/login')} className="btn-secondary text-sm flex-1 text-center">Sign In</button>
                    <button onClick={() => navigate('/register')} className="btn-primary text-sm flex-1 text-center">Get Started</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs mb-6">
                <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                Premium Property Management Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Simplify Rental{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                  Management
                </span>{' '}
                with Domicilo
              </h1>
              <p className="text-lg text-blue-100/80 mb-8 max-w-lg">
                The all-in-one platform for property owners to manage rentals, track payments, and grow their portfolio. 
                Tenants get a seamless experience with easy payments and real-time updates.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/register')} className="px-8 py-3 rounded-xl bg-white text-primary-800 font-semibold hover:shadow-xl hover:shadow-white/20 transition-all hover:-translate-y-0.5">
                  Get Started Free
                </button>
                <button onClick={() => navigate('/properties')} className="px-8 py-3 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition-all">
                  Browse Properties <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <div className="relative">
                <div className="w-full aspect-[4/3] rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-2">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🏠</div>
                      <p className="text-white/60 text-sm">Interactive Dashboard Preview</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-xl gradient-card flex items-center justify-center shadow-2xl">
                  <div className="text-center text-white">
                    <p className="text-2xl font-bold">99%</p>
                    <p className="text-xs text-white/70">Uptime</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-16 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="glass rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-blue-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, property name..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-blue-200/60 text-sm py-2"
                />
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-white text-primary-800 font-medium text-sm hover:shadow-lg transition-all whitespace-nowrap">
                Search Properties
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to{' '}
            <span className="gradient-text">manage rentals</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful tools for property owners and a seamless experience for tenants.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto gradient-card rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to transform your rental management?</h2>
            <p className="text-blue-100/80 mb-8 max-w-lg mx-auto">Join thousands of property owners and tenants already using Domicilo.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/register')} className="px-8 py-3 rounded-xl bg-white text-primary-800 font-semibold hover:shadow-xl hover:shadow-white/20 transition-all">
                Start Free Trial
              </button>
              <button onClick={() => navigate('/contact')} className="px-8 py-3 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition-all">
                Talk to Sales
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">Domicilo</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Premium property rental management platform.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Platform</h4>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/properties" className="block hover:text-primary-600">Browse Properties</Link>
              <Link to="/register" className="block hover:text-primary-600">List Property</Link>
              <Link to="/pricing" className="block hover:text-primary-600">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Company</h4>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/about" className="block hover:text-primary-600">About Us</Link>
              <Link to="/contact" className="block hover:text-primary-600">Contact</Link>
              <Link to="/privacy" className="block hover:text-primary-600">Privacy Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Support</h4>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <a href="mailto:support@domicilo.com" className="block hover:text-primary-600">support@domicilo.com</a>
              <a href="tel:+919999999999" className="block hover:text-primary-600">+91 99999 99999</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Domicilo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
