import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Mail, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/endpoints';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if account exists');
    } catch {
      toast.error('Failed to send reset email');
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
              <Mail className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                If an account with that email exists, we've sent a password reset link.
              </p>
              <Link to="/login" className="text-primary-600 hover:underline text-sm font-medium">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Forgot Password?</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-4 hover:text-primary-600">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
