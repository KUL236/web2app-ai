import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Menu, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

export default function Navbar() {
  const { isAuthenticated, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-900/95 backdrop-blur-xl border-b border-white/5 shadow-glass' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
            <Smartphone size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Web2App<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">
                Dashboard
              </Button>
              <Button variant="secondary" onClick={handleSignOut} size="sm">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')} size="sm">
                Sign In
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/signup')}
                size="sm"
                iconRight={<ChevronRight size={14} />}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900/98 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className="text-gray-400 hover:text-white py-2 text-sm font-medium transition-colors">
                  {link.label}
                </a>
              ))}
              <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')} className="w-full justify-center">
                      Dashboard
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-center">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" onClick={() => navigate('/login')} className="w-full justify-center">
                      Sign In
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/signup')} className="w-full justify-center">
                      Get Started Free
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
