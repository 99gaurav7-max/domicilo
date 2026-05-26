import { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Lock, Loader2, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
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
    if (!token) { toast.error('The royal seal is missing — no token found'); return; }
    if (!isFormValid) { toast.error('Please inscribe your key correctly'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Your key has been reforged! Enter thy realm.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'The royal seal has expired or is invalid');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-2xl border text-sm transition-all outline-none bg-white/70 dark:bg-black/30 backdrop-blur-sm ${
      hasError
        ? 'border-red-400 dark:border-red-500 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30'
        : 'border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50'
    }`;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Broken Seal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">The sacred seal is missing or has crumbled to dust. Request a new one from the court.</p>
          <Link to="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-royal-600 to-royal-800 hover:shadow-2xl hover:shadow-royal-500/30 border border-royal-400/20">
            Request New Seal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center shadow-lg shadow-royal-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5 text-gold-400" />
          </div>
          <span className="font-bold text-xl gradient-text">Domicilo</span>
        </Link>
        <div className="rounded-3xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-royal-500/10 border border-royal-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-royal-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Forge a New Key</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Inscribe thy new secret key for the realm.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Secret Key</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Secret Key</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  placeholder="Re-enter key" className={`${inputClass(!!errors.confirmPassword)} pr-10`} autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
              {confirmPassword && !errors.confirmPassword && <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Keys match</p>}
            </div>
            <button type="submit" disabled={loading || !token}
              className="w-full px-6 py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-300 bg-gradient-to-r from-royal-600 to-royal-800 hover:shadow-2xl hover:shadow-royal-500/30 hover:-translate-y-0.5 border border-royal-400/20 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Forging...' : 'Forge New Key'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
