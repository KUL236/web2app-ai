import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, Clock, Loader2, Download,
  ExternalLink, RefreshCw, ArrowLeft, Smartphone, Terminal
} from 'lucide-react'
import { useBuild } from '../hooks/useBuilds'
import { Badge, ProgressBar } from '../components/ui/Card'
import { getBuildStatusColor, getBuildStatusLabel, formatDate, formatBytes } from '../lib/utils'
import Button from '../components/ui/Button'
import DashboardLayout from './DashboardLayout'

const STEPS = [
  { key: 'queued', label: 'Build Queued', description: 'Waiting for GitHub Actions runner' },
  { key: 'building', label: 'Building APK', description: 'Compiling Kotlin source code' },
  { key: 'signing', label: 'Signing APK', description: 'Signing with release keystore' },
  { key: 'complete', label: 'Build Complete', description: 'APK ready for download' },
]

const STATUS_PROGRESS = { queued: 10, building: 40, signing: 75, complete: 100, failed: 0 }
const STATUS_ICONS = {
  queued: <Clock size={18} className="text-gray-400" />,
  building: <Loader2 size={18} className="text-brand-400 animate-spin" />,
  signing: <Loader2 size={18} className="text-yellow-400 animate-spin" />,
  complete: <CheckCircle size={18} className="text-green-400" />,
  failed: <XCircle size={18} className="text-red-400" />,
}

function BuildStep({ step, currentStatus }) {
  const statusOrder = ['queued', 'building', 'signing', 'complete']
  const stepIndex = statusOrder.indexOf(step.key)
  const currentIndex = statusOrder.indexOf(currentStatus)
  const isFailed = currentStatus === 'failed'

  const isDone = stepIndex < currentIndex
  const isActive = stepIndex === currentIndex
  const isPending = stepIndex > currentIndex

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
      isActive ? 'bg-brand-500/10 border border-brand-500/20' : ''
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isDone ? 'bg-green-500/20' :
        isActive ? 'bg-brand-500/20' :
        isFailed && stepIndex <= currentIndex ? 'bg-red-500/20' :
        'bg-dark-700'
      }`}>
        {isDone ? (
          <CheckCircle size={16} className="text-green-400" />
        ) : isActive ? (
          currentStatus === 'failed' ? <XCircle size={16} className="text-red-400" /> :
          <Loader2 size={16} className="text-brand-400 animate-spin" />
        ) : (
          <span className="text-xs text-gray-500 font-mono">{stepIndex + 1}</span>
        )}
      </div>
      <div>
        <p className={`text-sm font-medium ${
          isDone ? 'text-green-400' :
          isActive ? 'text-white' :
          'text-gray-500'
        }`}>{step.label}</p>
        <p className="text-xs text-gray-500">{step.description}</p>
      </div>
    </div>
  )
}

export default function BuildStatus() {
  const { buildId } = useParams()
  const navigate = useNavigate()
  const { build, loading, error, refetch } = useBuild(buildId)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!build?.started_at || build?.completed_at) return
    const start = new Date(build.started_at).getTime()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [build?.started_at, build?.completed_at])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-brand-400 animate-spin" />
            <p className="text-gray-400">Loading build status...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !build) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <XCircle size={40} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Build not found</h2>
          <p className="text-gray-400 mb-6">{error || 'This build does not exist or belongs to another user.'}</p>
          <Button variant="secondary" onClick={() => navigate('/builds')} icon={<ArrowLeft size={16} />}>
            Back to Builds
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const progress = STATUS_PROGRESS[build.status] || 0
  const isTerminal = ['complete', 'failed'].includes(build.status)

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/builds')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> All Builds
        </button>

        {/* Main status card */}
        <div className="card mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: (build.apps?.icon_color || '#6366f1') + '22' }}
              >
                {build.apps?.icon_url ? (
                  <img src={build.apps.icon_url} alt={build.apps?.app_name || 'App icon'} className="w-full h-full object-cover" />
                ) : (
                  <Smartphone size={22} style={{ color: build.apps?.icon_color || '#6366f1' }} />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{build.apps?.app_name}</h1>
                <p className="text-sm text-gray-400 font-mono">{build.apps?.package_name}</p>
              </div>
            </div>
            <Badge variant={getBuildStatusColor(build.status)}>
              {STATUS_ICONS[build.status]}
              {getBuildStatusLabel(build.status)}
            </Badge>
          </div>

          {/* Progress */}
          {!isTerminal && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Build progress</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
              {elapsed > 0 && (
                <p className="text-xs text-gray-500 mt-1.5 text-right">
                  Elapsed: {Math.floor(elapsed / 60)}m {elapsed % 60}s
                </p>
              )}
            </div>
          )}

          {/* Success state */}
          {build.status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle size={20} className="text-green-400" />
                <div>
                  <p className="text-sm font-semibold text-green-400">APK Ready!</p>
                  <p className="text-xs text-gray-400">Your signed Android APK is ready to download.</p>
                </div>
              </div>
              {build.download_url && (
                <a href={build.download_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="success" icon={<Download size={16} />} className="w-full justify-center">
                    Download APK
                  </Button>
                </a>
              )}
            </motion.div>
          )}

          {/* Failed state */}
          {build.status === 'failed' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
              <div className="flex items-center gap-3 mb-2">
                <XCircle size={20} className="text-red-400" />
                <p className="text-sm font-semibold text-red-400">Build Failed</p>
              </div>
              {build.error_message && (
                <p className="text-xs text-gray-400 bg-dark-900 rounded-lg p-3 font-mono">
                  {build.error_message}
                </p>
              )}
              <Button
                variant="secondary"
                icon={<RefreshCw size={16} />}
                className="mt-3"
                onClick={() => navigate('/create-app')}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Build metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Build ID', value: build.id?.slice(0, 8) + '...' },
              { label: 'Started', value: build.started_at ? formatDate(build.started_at) : 'Pending' },
              { label: 'Completed', value: build.completed_at ? formatDate(build.completed_at) : '—' },
              { label: 'Website', value: build.apps?.website_url?.replace(/^https?:\/\//, '').slice(0, 20) + '...' },
              { label: 'APK Size', value: build.apk_size ? formatBytes(build.apk_size) : '—' },
              { label: 'Run ID', value: build.github_run_id || '—' },
            ].map(item => (
              <div key={item.label} className="bg-dark-900 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-xs text-white font-mono truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Build steps */}
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal size={15} className="text-brand-400" />
            Build Pipeline
          </h2>
          <div className="space-y-1">
            {STEPS.map(step => (
              <BuildStep key={step.key} step={step} currentStatus={build.status} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isTerminal && (
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={refetch}>
              Refresh
            </Button>
          )}
          {build.apps?.website_url && (
            <a href={build.apps.website_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" icon={<ExternalLink size={16} />}>
                Visit Website
              </Button>
            </a>
          )}
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
