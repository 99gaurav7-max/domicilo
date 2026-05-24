import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Loader2, Shield, Building2, User, Check, Crown, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/endpoints';

function validateEmail(v: string) {
  if (!v) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address';
}

function validatePassword(v: string) {
  if (!v) return '';
  if (v.length < 8) return 'At least 8 characters';
  return '';
}

function validatePhone(v: string) {
  if (!v) return '';
  if (!/^[6-9]\d{9}$/.test(v)) return 'Must be a valid 10-digit Indian number starting with 6-9';
  return '';
}

function validateFullName(v: string) {
  if (!v) return '';
  if (v.trim().length < 2) return 'Enter your full name';
  return '';
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'owner' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await authApi.checkAdminExists();
        if (res.data.exists) setAdminExists(true);
      } catch {}
      setCheckingAdmin(false);
    })();
  }, []);

  const errors = useMemo(() => ({
    fullName: touched.fullName ? validateFullName(form.fullName) : '',
    email: touched.email ? validateEmail(form.email) : '',
    phone: touched.phone ? validatePhone(form.phone) : '',
    password: touched.password ? validatePassword(form.password) : '',
    confirmPassword: touched.confirmPassword && form.confirmPassword && form.password !== form.confirmPassword ? 'Passwords do not match' : '',
  }), [form, touched]);

  const isFormValid = !validateFullName(form.fullName) && !validateEmail(form.email) && !validatePhone(form.phone) && !validatePassword(form.password) && form.password === form.confirmPassword && form.phone.length === 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, password: true, confirmPassword: true });
    if (!isFormValid) { toast.error('Please fix all errors before submitting'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = form;
      registerData.phone = '+91' + form.phone;
      await authApi.register(registerData);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'owner', label: 'Owner', icon: Building2, desc: 'List and manage your rental properties', premium: true },
    { value: 'other', label: 'Other', icon: User, desc: 'Browse properties and enquire — upgrade to tenant later', premium: false },
    { value: 'admin', label: 'Admin', icon: Shield, desc: 'Platform administration (Master account)', premium: true },
  ];

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
      hasError
        ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'
    }`;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join Domicilo</h2>
          <p className="text-blue-100/80 max-w-sm mx-auto">Create your account and start your rental journey — as an owner, an admin, or a future tenant.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-950">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">Domicilo</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create an account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} onBlur={() => setTouched({ ...touched, fullName: true })}
                placeholder="John Doe" className={inputClass(!!errors.fullName)} autoComplete="name" />
              {errors.fullName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="you@example.com" className={inputClass(!!errors.email)} autoComplete="email" />
              {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
              <div className="relative">
                <div className="flex items-stretch">
                  <span className={`inline-flex items-center px-3 rounded-l-xl border border-r-0 text-sm font-mono select-none ${errors.phone ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    +91
                  </span>
                  <input type="tel" value={form.phone} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm({ ...form, phone: v }); }}
                    onBlur={() => setTouched({ ...touched, phone: true })}
                    placeholder="9876543210" maxLength={10}
                    className={`flex-1 min-w-0 rounded-r-xl text-sm transition-all outline-none px-4 py-2.5 ${errors.phone ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30 border' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'}`} />
                </div>
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
              {form.phone && !errors.phone && touched.phone && <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Valid number</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  placeholder="Min. 8 characters" className={`w-full px-4 py-2.5 rounded-xl border text-sm pr-10 transition-all outline-none ${errors.password ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'}`} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
              {form.password && !errors.password && <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Strong enough</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  placeholder="Re-enter password" className={`w-full px-4 py-2.5 rounded-xl border text-sm pr-10 transition-all outline-none ${errors.confirmPassword ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'}`} autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
              {form.confirmPassword && !errors.confirmPassword && <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Passwords match</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">I want to register as *</label>
              <div className="grid gap-2.5">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const selected = form.role === r.value;
                  const isAdminDisabled = r.value === 'admin' && adminExists;
                  return (
                    <button key={r.value} type="button" disabled={isAdminDisabled}
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        selected && !isAdminDisabled
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm'
                          : isAdminDisabled
                          ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selected && !isAdminDisabled ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${selected && !isAdminDisabled ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'}`}>
                            {r.label}
                          </span>
                          {r.premium && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-700 dark:text-amber-400">PREMIUM</span>}
                          {selected && !isAdminDisabled && <Check className="w-4 h-4 text-primary-600 ml-auto" />}
                          {r.value === 'admin' && adminExists && <span className="text-xs text-red-500 ml-auto">Unavailable</span>}
                        </div>
                        <p className={`text-xs mt-0.5 ${isAdminDisabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {r.desc}
                        </p>
                        {r.value === 'admin' && adminExists && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                            Master account already provisioned — only one admin is permitted per platform.
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading || (form.role === 'admin' && adminExists)} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
