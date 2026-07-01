import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Smartphone, Activity, Download, PlusCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApps } from '../hooks/useApps'
import { useRecentBuilds } from '../hooks/useBuilds'
import { StatsCard, AppCard, BuildCard } from '../components/dashboard/AppCard'
import { Spinner, EmptyState } from '../components/ui/Card'
import Button from '../components/ui/Button'
import DashboardLayout from './DashboardLayout'

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { apps, loading: appsLoading } = useApps()
  const { builds, loading: buildsLoading } = useRecentBuilds(5)

  const completedBuilds = builds.filter(b => b.status === 'complete').length
  const activeBuilds = builds.filter(b => ['queued', 'building', 'signing'].includes(b.status)).length

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here's what's happening with your apps.</p>
          </div>
          <Button
            variant="primary"
            icon={<PlusCircle size={16} />}
            onClick={() => navigate('/create-app')}
            className="hidden sm:flex"
          >
            New App
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={<Smartphone size={20} />} label="Total Apps" value={apps.length} color="brand" />
          <StatsCard icon={<Activity size={20} />} label="Total Builds" value={builds.length} color="purple" />
          <StatsCard icon={<Download size={20} />} label="Completed" value={completedBuilds} color="green" />
          <StatsCard icon={<Activity size={20} />} label="Active Builds" value={activeBuilds} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apps grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Apps</h2>
              <button
                onClick={() => navigate('/create-app')}
                className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                Add new <ArrowRight size={14} />
              </button>
            </div>

            {appsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : apps.length === 0 ? (
              <EmptyState
                icon={<Smartphone size={24} />}
                title="No apps yet"
                description="Create your first Android app by entering a website URL."
                action={
                  <Button variant="primary" onClick={() => navigate('/create-app')} icon={<PlusCircle size={16} />}>
                    Create First App
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {apps.map(app => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            )}
          </div>

          {/* Recent builds */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Builds</h2>
              <button
                onClick={() => navigate('/builds')}
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                View all
              </button>
            </div>
            <div className="card">
              {buildsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : builds.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No builds yet</p>
                </div>
              ) : (
                builds.map(build => <BuildCard key={build.id} build={build} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
