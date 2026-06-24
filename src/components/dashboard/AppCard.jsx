import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ExternalLink, Smartphone, Clock, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react'
import { Badge } from '../ui/Card'
import { timeAgo, getBuildStatusColor, getBuildStatusLabel, formatBytes } from '../../lib/utils'

export function StatsCard({ icon, label, value, change, color = 'brand' }) {
  const colors = {
    brand: 'from-brand-500/20 to-brand-600/5 border-brand-500/20',
    green: 'from-green-500/20 to-green-600/5 border-green-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  }
  const iconColors = {
    brand: 'text-brand-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`${iconColors[color]} opacity-80`}>{icon}</div>
        {change !== undefined && (
          <span className={`text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}

export function AppCard({ app }) {
  const latestBuild = app.builds?.[0]

  const statusIcons = {
    complete: <CheckCircle size={14} className="text-green-400" />,
    failed: <XCircle size={14} className="text-red-400" />,
    building: <Loader2 size={14} className="text-brand-400 animate-spin" />,
    queued: <Clock size={14} className="text-gray-400" />,
    signing: <Loader2 size={14} className="text-yellow-400 animate-spin" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-hover group"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: app.icon_color + '33', border: `1px solid ${app.icon_color}33` }}
          >
            <Smartphone size={18} style={{ color: app.icon_color }} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{app.app_name}</h3>
            <p className="text-xs text-gray-500 font-mono">{app.package_name}</p>
          </div>
        </div>
        {latestBuild && (
          <Badge variant={getBuildStatusColor(latestBuild.status)}>
            {statusIcons[latestBuild.status]}
            {getBuildStatusLabel(latestBuild.status)}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <ExternalLink size={12} className="text-gray-500 flex-shrink-0" />
        <a
          href={app.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-brand-400 transition-colors truncate"
          onClick={e => e.stopPropagation()}
        >
          {app.website_url}
        </a>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{timeAgo(app.created_at)}</span>
        <div className="flex items-center gap-2">
          {latestBuild?.status === 'complete' && latestBuild.download_url && (
            <Link
              to="/downloads"
              className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <Download size={12} /> Download
            </Link>
          )}
          <Link
            to={`/builds/${latestBuild?.id || ''}`}
            className="text-xs text-gray-400 hover:text-white font-medium transition-colors"
          >
            View Build →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export function BuildCard({ build }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: (build.apps?.icon_color || '#6366f1') + '22' }}
      >
        <Smartphone size={14} style={{ color: build.apps?.icon_color || '#6366f1' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {build.apps?.app_name || 'Unknown App'}
        </p>
        <p className="text-xs text-gray-500">{timeAgo(build.created_at)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant={getBuildStatusColor(build.status)}>
          {getBuildStatusLabel(build.status)}
        </Badge>
        {build.status === 'complete' && build.download_url && (
          <a
            href={build.download_url}
            className="p-1.5 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 transition-colors"
            title="Download APK"
          >
            <Download size={13} />
          </a>
        )}
      </div>
    </motion.div>
  )
}
