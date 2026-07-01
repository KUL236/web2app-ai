import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// Card
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`${hover ? 'card-hover' : 'card'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Badge
export function Badge({ children, variant = 'gray', className = '' }) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    gray: 'badge-gray',
  }
  return (
    <span className={`${variants[variant] || 'badge-gray'} ${className}`}>
      {children}
    </span>
  )
}

// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }
  return (
    <div
      className={`${sizes[size]} rounded-full border-brand-500 border-t-transparent animate-spin ${className}`}
    />
  )
}

// Modal
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative w-full ${sizes[size]} bg-dark-800 border border-white/10 rounded-2xl p-6 shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-white/5 flex items-center justify-center text-gray-500 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}

// Progress bar
export function ProgressBar({ value = 0, className = '' }) {
  return (
    <div className={`w-full bg-dark-700 rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full"
      />
    </div>
  )
}
