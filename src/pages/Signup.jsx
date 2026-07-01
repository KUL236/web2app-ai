import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Smartphone, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

const perks = [
  '3 free app builds per month',
  'GitHub Actions CI/CD pipeline',
  'Signed production APKs',
  'Native Android features included',
]

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    setErrors({})
    try {
      await signUp({ email: form.email, password: form.password, fullName: form.fullName })
      toast.success('Account created! Welcome to Web2App AI.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Failed to create account')
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-12 w-1/2 bg-gradient-to-br from-purple-900/30 to-dark-900 border-r border-white/5">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
            <Smartphone size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">Web2App<span className="gradient-text">AI</span></span>
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">
          Start building<br />
          <span className="gradient-text">for free</span>
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Create an account and get your first Android app in minutes.
        </p>
        <div className="space-y-3">
          {perks.map(perk => (
            <div key={perk} className="flex items-center gap-3 text-gray-300 text-sm">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              {perk}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Smartphone size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Web2App<span className="gradient-text">AI</span></span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-400 text-sm">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your name"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              error={errors.fullName}
              icon={<User size={16} />}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              error={errors.password}
              icon={<Lock size={16} />}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              error={errors.confirmPassword}
              icon={<Lock size={16} />}
              autoComplete="new-password"
            />

            {errors.form && (
              <p className="text-sm text-red-400 text-center">{errors.form}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              loading={loading}
              size="lg"
            >
              Create Account
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
