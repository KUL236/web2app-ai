import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

import Home from '../pages/Home'
import Pricing from '../pages/Pricing'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from '../pages/ForgotPassword'
import Dashboard from '../pages/Dashboard'
import CreateApp from '../pages/CreateApp'
import BuildStatus from '../pages/BuildStatus'
import Builds from '../pages/Builds'
import DownloadCenter from '../pages/DownloadCenter'
import Settings from '../pages/Settings'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-app" element={<ProtectedRoute><CreateApp /></ProtectedRoute>} />
          <Route path="/builds" element={<ProtectedRoute><Builds /></ProtectedRoute>} />
          <Route path="/builds/:buildId" element={<ProtectedRoute><BuildStatus /></ProtectedRoute>} />
          <Route path="/downloads" element={<ProtectedRoute><DownloadCenter /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
