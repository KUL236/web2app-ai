import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useApps() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApps = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          builds (
            id, status, created_at, completed_at, download_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setApps(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  const deleteApp = async (appId) => {
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', appId)
      .eq('user_id', user.id)
    if (error) throw error
    setApps(prev => prev.filter(a => a.id !== appId))
  }

  return { apps, loading, error, refetch: fetchApps, deleteApp }
}

export function useApp(appId) {
  const { user } = useAuth()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || !appId) return
    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .eq('user_id', user.id)
        .single()
      if (error) setError(error.message)
      else setApp(data)
      setLoading(false)
    }
    fetch()
  }, [user, appId])

  return { app, loading, error }
}
