import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
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
      toast.success('Reset link sent if account exists');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not send reset email. Check SMTP configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">Domicilo</span>
        </Link>
        <div className="glass-card rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                We sent a password reset link to <strong className="text-gray-700 dark:text-gray-300">{email}</strong>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => { setSent(false); setLoading(false); }} className="text-primary-600 hover:underline font-medium">
                  try again
                </button>
              </p>
              <Link to="/login" className="text-primary-600 hover:underline text-sm font-medium">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Forgot Password?</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">No worries — enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="you@example.com" autoComplete="email"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                      emailError
                        ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'
                    }`} />
                  {emailError && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{emailError}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-4 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
