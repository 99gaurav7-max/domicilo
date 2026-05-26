import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, LogOut, Loader2, Lock, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/endpoints';
import { Modal } from '../components/ui/Modal';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account preferences</p>
      </div>

      {/* Profile Info */}
      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl p-6">
        <h3 className="font-semibold font-display text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-royal-500" /> Profile
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center text-white font-bold text-lg">
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email} {user?.phone && `| ${user?.phone}`}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-royal-50 dark:bg-royal-900/20 text-royal-700 dark:text-royal-400 capitalize">
            <Shield className="w-3 h-3" /> {user?.role}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl p-6">
        <h3 className="font-semibold font-display text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-royal-500" /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password"
            className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password"
            className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password"
            className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
          <button type="submit" disabled={changingPassword} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white hover:shadow-xl hover:shadow-royal-500/20 px-4 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
            {changingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {changingPassword ? 'Changing...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Sign Out */}
      <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>

      {/* Delete Account */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-2">Permanently delete your account and all associated data</p>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">This action is irreversible</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                All your data will be permanently deleted. This cannot be undone.
                {user?.role === 'admin' && ' Admin accounts may not be deletable if it is the only admin.'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2.5 text-sm">
              Cancel
            </button>
            <button onClick={async () => {
              setDeleting(true);
              try {
                await authApi.deleteAccount();
                toast.success('Account deleted.');
                setShowDeleteModal(false);
                logout();
              } catch (err: any) {
                toast.error(err.response?.data?.error || 'Failed to delete account');
                setDeleting(false);
              }
            }} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
