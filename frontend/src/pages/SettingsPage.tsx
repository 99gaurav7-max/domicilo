import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Sun, Moon, LogOut, Loader2, Lock, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { authApi } from '../services/endpoints';
import { Card } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, setTheme } = useThemeStore();
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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account preferences</p>
      </div>

      {/* Profile Info */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-500" /> Profile
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg">
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{user?.email} {user?.phone && `| ${user?.phone}`}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 capitalize">
            <Shield className="w-3 h-3" /> {user?.role}
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-primary-500" /> : <Sun className="w-4 h-4 text-primary-500" />} Appearance
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme}
            className={`flex-1 p-3 rounded-xl border-2 transition-all text-center text-gray-700 dark:text-gray-300 ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <Sun className="w-5 h-5 mx-auto mb-1" /> Light
          </button>
          <button onClick={() => setTheme('dark')}
            className={`flex-1 p-3 rounded-xl border-2 transition-all text-center text-gray-700 dark:text-gray-300 ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <Moon className="w-5 h-5 mx-auto mb-1" /> Dark
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Theme auto-switches based on sunrise/sunset in your timezone.</p>
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary-500" /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          <button type="submit" disabled={changingPassword} className="btn-primary text-sm flex items-center gap-2">
            {changingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {changingPassword ? 'Changing...' : 'Update Password'}
          </button>
        </form>
      </Card>

      {/* Sign Out */}
      <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>

      {/* Delete Account */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
        <p className="text-xs text-gray-400 mt-1 ml-2">Permanently delete your account and all associated data</p>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
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
            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button onClick={async () => {
              setDeleting(true);
              try {
                await authApi.deleteAccount();
                toast.success('Account deleted.');
                logout();
              } catch (err: any) {
                toast.error(err.response?.data?.error || 'Failed to delete account');
              } finally {
                setDeleting(false);
                setShowDeleteModal(false);
              }
            }} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
