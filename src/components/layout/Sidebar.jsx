import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone, LayoutDashboard, PlusCircle, Activity,
  Download, Settings, LogOut, Bell, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Create App', icon: PlusCircle, href: '/create-app' },
  { label: 'Build Status', icon: Activity, href: '/builds' },
  { label: 'Downloads', icon: Download, href: '/downloads' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 mb-2">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
            <Smartphone size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-base">
            Web2App<span className="gradient-text">AI</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Create App CTA */}
      <div className="px-3 mb-4">
        <Link
          to="/create-app"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-white text-sm font-semibold transition-all duration-200 shadow-glow-sm hover:shadow-glow group"
        >
          <PlusCircle size={16} />
          New App
          <ChevronRight size={14} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <item.icon size={18} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-white/5 mt-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(profile?.full_name || user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full mt-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-dark-800 border-r border-white/5 h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 bg-dark-800 border-r border-white/5 z-50 lg:hidden overflow-y-auto"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
