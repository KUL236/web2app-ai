import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useBuilds() {
  const { user } = useAuth()
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBuilds = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('builds')
        .select(`
          *,
          apps (id, app_name, website_url, package_name, icon_color, icon_url, icon_source)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setBuilds(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBuilds()
  }, [fetchBuilds])

  return { builds, loading, error, refetch: fetchBuilds }
}

export function useBuild(buildId) {
  const { user } = useAuth()
  const [build, setBuild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBuild = useCallback(async () => {
    if (!user || !buildId) return
    const { data, error } = await supabase
      .from('builds')
      .select(`
        *,
        apps (id, app_name, website_url, package_name, icon_color, icon_url, icon_source)
      `)
      .eq('id', buildId)
      .eq('user_id', user.id)
      .single()
    if (error) setError(error.message)
    else setBuild(data)
    setLoading(false)
  }, [user, buildId])

  useEffect(() => {
    fetchBuild()

    // Poll every 5 seconds for non-terminal states
    const interval = setInterval(async () => {
      if (!build || ['complete', 'failed'].includes(build?.status)) return
      const { data } = await supabase
        .from('builds')
        .select(`*, apps (id, app_name, website_url, package_name, icon_color, icon_url, icon_source)`)
        .eq('id', buildId)
        .single()
      if (data) setBuild(data)
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchBuild, buildId, build?.status])

  return { build, loading, error, refetch: fetchBuild }
}

export function useRecentBuilds(limit = 5) {
  const { user } = useAuth()
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const { data } = await supabase
        .from('builds')
        .select(`*, apps (app_name, icon_color, icon_url, icon_source)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)
      setBuilds(data || [])
      setLoading(false)
    }
    fetch()
  }, [user, limit])

  return { builds, loading }
}
