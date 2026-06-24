import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Smartphone, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    setErrors({})
    try {
      await signIn({ email: form.email, password: form.password })
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-12 w-1/2 bg-gradient-to-br from-brand-900/40 to-dark-900 border-r border-white/5">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
            <Smartphone size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">Web2App<span className="gradient-text">AI</span></span>
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
          Turn websites into<br />
          <span className="gradient-text">Android apps</span><br />
          in minutes.
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          No coding. No Android Studio. Just paste a URL and get a signed APK.
        </p>
        <div className="space-y-3">
          {['GitHub Actions CI/CD pipeline', 'Signed production APK', 'Native Android features', 'Instant download'].map(f => (
            <div key={f} className="flex items-center gap-3 text-gray-300 text-sm">
              <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <ArrowRight size={11} className="text-brand-400" />
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
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
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              error={errors.password}
              icon={<Lock size={16} />}
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </Link>
            </div>

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
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
