import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Eye, EyeOff, Loader2, AlertCircle, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

function validateEmail(v: string) {
  if (!v) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const emailError = touched.email ? validateEmail(email) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (emailError) { toast.error('Please enter a valid email'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Your Grace!');
      const user = useAuthStore.getState().user;
      if (user) navigate(user.role === 'other' ? '/properties' : `/${user.role}/dashboard`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-royal-900 via-royal-950 to-black" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-royal-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-500/10 rounded-full blur-[100px]" />
        <div className="relative z-10 text-center max-w-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-royal-500 to-royal-700 border border-royal-400/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-royal-500/30"
          >
            <Crown className="w-12 h-12 text-gold-400" />
          </motion.div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">Welcome Back,<br />Your Grace</h2>
          <p className="text-white/50 max-w-sm mx-auto leading-relaxed">
            Your kingdom awaits. Access your realm, manage your estates, and command your empire.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10 justify-center lg:justify-start group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center shadow-lg shadow-royal-500/20 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 text-gold-400" />
            </div>
            <span className="font-bold text-xl gradient-text">Domicilo</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Return to your realm</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Or{' '}
            <Link to="/register" className="text-royal-500 hover:text-royal-400 font-medium">
              claim a new throne
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Royal Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="royal@example.com" autoComplete="email"
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-all outline-none bg-white/70 dark:bg-black/30 backdrop-blur-sm ${
                  emailError
                    ? 'border-red-400 dark:border-red-500 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30'
                    : 'border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50'
                }`} />
              {emailError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{emailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Secret Key</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  placeholder="Your secret key" autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-sm text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 transition-all pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-royal-500 hover:text-royal-400 font-medium">
                Lost your key?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full px-6 py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-300 bg-gradient-to-r from-royal-600 to-royal-800 hover:shadow-2xl hover:shadow-royal-500/30 hover:-translate-y-0.5 border border-royal-400/20 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Entering the realm...' : 'Enter the Realm'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
