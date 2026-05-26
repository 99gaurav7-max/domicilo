import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/endpoints';

function validateEmail(v: string) {
  if (!v) return 'Email is required';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address';
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailError = touched ? validateEmail(email) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (emailError) { toast.error(emailError); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('A raven has been dispatched');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'The raven could not be sent. Check the realm\'s postal system.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center shadow-lg shadow-royal-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5 text-gold-400" />
          </div>
          <span className="font-bold text-xl gradient-text">Domicilo</span>
        </Link>
        <div className="rounded-3xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-2xl shadow-black/5 dark:shadow-black/20 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">A Raven is En Route</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                We dispatched a secret scroll to <strong className="text-gray-700 dark:text-gray-300">{email}</strong>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
                Did the raven lose its way? Check the shadows (spam folder) or{' '}
                <button onClick={() => { setSent(false); setLoading(false); }} className="text-royal-500 hover:underline font-medium">
                  send another
                </button>
              </p>
              <Link to="/login" className="text-royal-500 hover:text-royal-400 text-sm font-medium">Return to the Gate</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Lost Your Key?</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Fear not, noble one. Tell us your royal email and we shall send a raven with a new key.</p>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Royal Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="royal@example.com" autoComplete="email"
                    className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-all outline-none bg-white/70 dark:bg-black/30 backdrop-blur-sm ${
                      emailError
                        ? 'border-red-400 dark:border-red-500 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30'
                        : 'border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50'
                    }`} />
                  {emailError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{emailError}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full px-6 py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-300 bg-gradient-to-r from-royal-600 to-royal-800 hover:shadow-2xl hover:shadow-royal-500/30 hover:-translate-y-0.5 border border-royal-400/20 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Dispatching raven...' : 'Send Raven'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-royal-500 transition-colors mt-6">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to the Gate
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
