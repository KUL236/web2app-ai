/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format date to relative time
 */
export function timeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

/**
 * Format date to locale string
 */
export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Validate URL format
 */
export function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Generate Android package name from app name and URL
 */
export function generatePackageName(appName, websiteUrl) {
  try {
    const url = new URL(websiteUrl)
    const domain = url.hostname.replace('www.', '').split('.')[0]
    const cleanName = appName.toLowerCase().replace(/[^a-z0-9]/g, '')
    return `com.${domain}.${cleanName}`.substring(0, 50)
  } catch {
    const cleanName = appName.toLowerCase().replace(/[^a-z0-9]/g, '')
    return `com.web2app.${cleanName}`.substring(0, 50)
  }
}

/**
 * Truncate text
 */
export function truncate(str, length = 40) {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

/**
 * Get build status color
 */
export function getBuildStatusColor(status) {
  const map = {
    queued: 'gray',
    building: 'info',
    signing: 'warning',
    complete: 'success',
    failed: 'error',
  }
  return map[status] || 'gray'
}

/**
 * Get build status label
 */
export function getBuildStatusLabel(status) {
  const map = {
    queued: 'Queued',
    building: 'Building',
    signing: 'Signing APK',
    complete: 'Complete',
    failed: 'Failed',
  }
  return map[status] || status
}

/**
 * Sleep utility
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}
