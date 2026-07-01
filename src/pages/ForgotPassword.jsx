import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Smartphone, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return setError('Email is required')
    setLoading(true)
    setError('')
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Smartphone size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">Web2App<span className="gradient-text">AI</span></span>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm mb-6">
                We sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <Link to="/login">
                <Button variant="secondary" className="w-full justify-center">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Reset your password</h2>
                <p className="text-gray-400 text-sm">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={error}
                  icon={<Mail size={16} />}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  loading={loading}
                >
                  Send Reset Link
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 justify-center transition-colors">
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
