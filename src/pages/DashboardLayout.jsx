import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../lib/utils'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile } = useAuth()

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(profile?.full_name || user?.email)}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}
