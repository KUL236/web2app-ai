const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
    }
    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token' }) }
    }

    const buildId = event.queryStringParameters?.build_id
    if (!buildId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing build_id' }) }
    }

    const { data: build, error } = await supabase
      .from('builds')
      .select('id, status, download_url, user_id, apps(app_name)')
      .eq('id', buildId)
      .eq('user_id', user.id)
      .single()

    if (error || !build) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Build not found' }) }
    }

    if (build.status !== 'complete') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Build is not complete yet' }) }
    }

    if (!build.download_url) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Download URL not available' }) }
    }

    // Log the download
    await supabase.from('downloads').insert({
      build_id: buildId,
      user_id: user.id,
      ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        download_url: build.download_url,
        app_name: build.apps?.app_name,
        build_id: buildId,
      }),
    }
  } catch (err) {
    console.error('download-link error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
