import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Download, Loader2, Clock, CheckCircle, XCircle, Smartphone } from 'lucide-react'
import { useBuilds } from '../hooks/useBuilds'
import { Badge, Spinner, EmptyState } from '../components/ui/Card'
import { getBuildStatusColor, getBuildStatusLabel, formatDate, formatBytes, timeAgo } from '../lib/utils'
import Button from '../components/ui/Button'
import DashboardLayout from './DashboardLayout'

const STATUS_ICONS = {
  queued: <Clock size={12} />,
  building: <Loader2 size={12} className="animate-spin" />,
  signing: <Loader2 size={12} className="animate-spin" />,
  complete: <CheckCircle size={12} />,
  failed: <XCircle size={12} />,
}

export default function Builds() {
  const navigate = useNavigate()
  const { builds, loading, error, refetch } = useBuilds()

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Build History</h1>
            <p className="text-gray-400 text-sm mt-1">Track all your APK builds</p>
          </div>
          <Button variant="secondary" icon={<Activity size={16} />} onClick={refetch}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
          </div>
        ) : builds.length === 0 ? (
          <EmptyState
            icon={<Activity size={24} />}
            title="No builds yet"
            description="Create your first app to start building."
            action={
              <Button variant="primary" onClick={() => navigate('/create-app')}>
                Create App
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {builds.map((build, i) => (
              <motion.div
                key={build.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/builds/${build.id}`)}
                className="card-hover flex items-center gap-4 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: (build.apps?.icon_color || '#6366f1') + '22' }}
                >
                  {build.apps?.icon_url ? (
                    <img src={build.apps.icon_url} alt={build.apps?.app_name || 'App icon'} className="w-full h-full object-cover" />
                  ) : (
                    <Smartphone size={18} style={{ color: build.apps?.icon_color || '#6366f1' }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {build.apps?.app_name || 'Unknown App'}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-gray-500 font-mono">
                      #{build.id?.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo(build.created_at)}</p>
                    {build.apk_size && (
                      <p className="text-xs text-gray-500">{formatBytes(build.apk_size)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant={getBuildStatusColor(build.status)}>
                    {STATUS_ICONS[build.status]}
                    {getBuildStatusLabel(build.status)}
                  </Badge>

                  {build.status === 'complete' && build.download_url && (
                    <a
                      href={build.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-2 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 transition-colors"
                      title="Download APK"
                    >
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
