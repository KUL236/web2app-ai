import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95',
    success: 'bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95',
  }

  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-base px-8 py-4',
    xl: 'text-lg px-10 py-5',
  }

  const baseClass = variants[variant] || variants.primary

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${sizes[size]} inline-flex items-center gap-2 ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="flex-shrink-0">{iconRight}</span>
      )}
    </motion.button>
  )
}
