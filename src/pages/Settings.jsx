import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Save, Shield, Bell, Trash2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { getInitials } from '../lib/utils'
import toast from 'react-hot-toast'
import DashboardLayout from './DashboardLayout'

export default function Settings() {
  const { user, profile, updateProfile, updatePassword } = useAuth()

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.full_name.trim()) {
      return setErrors({ full_name: 'Name is required' })
    }
    setProfileLoading(true)
    try {
      await updateProfile({ full_name: profileForm.full_name.trim() })
      toast.success('Profile updated!')
      setErrors({})
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!passwordForm.newPassword) errs.newPassword = 'New password required'
    else if (passwordForm.newPassword.length < 8) errs.newPassword = 'Minimum 8 characters'
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }
    if (Object.keys(errs).length) return setErrors(errs)

    setPasswordLoading(true)
    try {
      await updatePassword(passwordForm.newPassword)
      toast.success('Password updated!')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
      setErrors({})
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const sections = [
    {
      id: 'profile',
      icon: <User size={16} className="text-brand-400" />,
      title: 'Profile',
      description: 'Update your personal information',
    },
    {
      id: 'security',
      icon: <Shield size={16} className="text-brand-400" />,
      title: 'Security',
      description: 'Manage your password',
    },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account preferences</p>
        </div>

        {/* Avatar */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
              {getInitials(profile?.full_name || user?.email)}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {profile?.full_name || 'User'}
              </h3>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-500/20 text-brand-400 border border-brand-500/20">
                {profile?.plan || 'Free'} Plan
              </span>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Profile Information</h2>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              label="Full Name"
              value={profileForm.full_name}
              onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
              error={errors.full_name}
              icon={<User size={16} />}
              placeholder="Your full name"
            />
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Email Address</label>
              <div className="input-field flex items-center gap-2 opacity-60 cursor-not-allowed">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={profileLoading}
              icon={<Save size={16} />}
            >
              Save Changes
            </Button>
          </form>
        </div>

        {/* Password form */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={16} className="text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
              error={errors.newPassword}
              icon={<Lock size={16} />}
              iconRight={
                <button type="button" onClick={() => setShowPassword(s => !s)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Input
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat new password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
              error={errors.confirmPassword}
              icon={<Lock size={16} />}
            />
            <Button
              type="submit"
              variant="primary"
              loading={passwordLoading}
              icon={<Lock size={16} />}
            >
              Update Password
            </Button>
          </form>
        </div>

        {/* Account info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Account Information</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Account ID', value: user?.id?.slice(0, 16) + '...' },
              { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
              { label: 'Current Plan', value: profile?.plan || 'Free' },
              { label: 'Total Apps Created', value: profile?.builds_count?.toString() || '0' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className="text-sm text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
