import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`input-field ${icon ? 'pl-10' : ''} ${iconRight ? 'pr-10' : ''} ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {iconRight}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  )
})

export default Input
