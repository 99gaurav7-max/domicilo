import { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Lock, Loader2, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/endpoints';

function validatePassword(v: string) {
  if (!v) return '';
  if (v.length < 8) return 'At least 8 characters';
  return '';
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => ({
    password: touched.password ? validatePassword(password) : '',
    confirmPassword: touched.confirmPassword && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : '',
  }), [password, confirmPassword, touched]);

  const isFormValid = !validatePassword(password) && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    if (!token) { toast.error('Invalid reset link — no token found in URL'); return; }
    if (!isFormValid) { toast.error('Please fix all errors'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
      hasError
        ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'
    }`;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This link is missing a token or has expired. Request a new one.</p>
          <Link to="/forgot-password" className="btn-primary inline-flex items-center gap-2">Request New Link</Link>
        </div>
      </div>
    );
  }

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
          <div className="text-center mb-6">
            <Lock className="w-10 h-10 text-primary-500 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reset Your Password</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your new password below.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  placeholder="Min. 8 characters" className={`${inputClass(!!errors.password)} pr-10`} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
              {password && !errors.password && <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Strong enough</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  placeholder="Re-enter password" className={`${inputClass(!!errors.confirmPassword)} pr-10`} autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
              {confirmPassword && !errors.confirmPassword && <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Passwords match</p>}
            </div>
            <button type="submit" disabled={loading || !token} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
