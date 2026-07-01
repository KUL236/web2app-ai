import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Smartphone, CheckCircle, Search, ExternalLink, Calendar } from 'lucide-react'
import { useBuilds } from '../hooks/useBuilds'
import { Spinner, EmptyState } from '../components/ui/Card'
import { formatDate, formatBytes, timeAgo } from '../lib/utils'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import DashboardLayout from './DashboardLayout'

export default function DownloadCenter() {
  const { user } = useAuth()
  const { builds, loading } = useBuilds()
  const [search, setSearch] = useState('')
  const [downloading, setDownloading] = useState(null)

  const completedBuilds = builds.filter(b => b.status === 'complete' && b.download_url)
  const filtered = completedBuilds.filter(b =>
    b.apps?.app_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.apps?.package_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDownload = async (build) => {
    setDownloading(build.id)
    try {
      // Log download
      await supabase.from('downloads').insert({
        build_id: build.id,
        user_id: user.id,
      })
      window.open(build.download_url, '_blank')
      toast.success('Download started!')
    } catch (err) {
      toast.error('Download failed')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Download Center</h1>
          <p className="text-gray-400 text-sm">All your completed APK builds ready to download.</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-white">{completedBuilds.length}</div>
            <div className="text-xs text-gray-400 mt-1">APKs Ready</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-white">
              {formatBytes(completedBuilds.reduce((acc, b) => acc + (b.apk_size || 0), 0))}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total Size</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-white">
              {new Set(completedBuilds.map(b => b.app_id)).size}
            </div>
            <div className="text-xs text-gray-400 mt-1">Unique Apps</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Download size={24} />}
            title={search ? 'No results found' : 'No downloads yet'}
            description={search ? 'Try a different search term.' : 'Completed builds will appear here.'}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((build, i) => (
              <motion.div
                key={build.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card flex items-center gap-4"
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: (build.apps?.icon_color || '#6366f1') + '22' }}
                >
                  <Smartphone size={22} style={{ color: build.apps?.icon_color || '#6366f1' }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {build.apps?.app_name}
                    </h3>
                    <span className="badge-success text-xs px-1.5 py-0.5 rounded-full">
                      <CheckCircle size={10} className="inline mr-1" />
                      Ready
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono truncate">{build.apps?.package_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {build.apk_size && (
                      <span className="text-xs text-gray-500">{formatBytes(build.apk_size)}</span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {timeAgo(build.completed_at)}
                    </span>
                    {build.apps?.website_url && (
                      <a
                        href={build.apps.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5 transition-colors"
                      >
                        <ExternalLink size={10} />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Download button */}
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download size={14} />}
                  loading={downloading === build.id}
                  onClick={() => handleDownload(build)}
                  className="flex-shrink-0"
                >
                  Download APK
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Install instructions */}
        {completedBuilds.length > 0 && (
          <div className="mt-8 p-5 bg-dark-800 border border-white/5 rounded-2xl">
            <h3 className="text-sm font-semibold text-white mb-3">📱 How to Install APK</h3>
            <ol className="space-y-1.5">
              {[
                'Download the APK file to your Android device',
                'Go to Settings → Security → Enable "Unknown Sources" or "Install unknown apps"',
                'Open the downloaded APK file and tap Install',
                'Launch the app from your home screen',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400">
                  <span className="w-4 h-4 rounded-full bg-dark-700 flex items-center justify-center text-gray-500 flex-shrink-0 mt-0.5 font-mono text-xs">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
