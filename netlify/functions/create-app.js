const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const githubToken = process.env.GITHUB_TOKEN
const githubOwner = process.env.GITHUB_OWNER
const githubRepo = process.env.GITHUB_REPO
const internalSecret = process.env.INTERNAL_SECRET
const ICON_BUCKET = 'app-icons'

let nodeWebSocket
if (typeof WebSocket === 'undefined' && typeof process !== 'undefined' && process.versions?.node) {
  try {
    nodeWebSocket = require('ws')
  } catch {
    nodeWebSocket = undefined
  }
}

function describeSupabaseKey(key) {
  if (!key) return 'missing'
  if (key.startsWith('sb_secret_')) return 'sb_secret_'
  if (key.startsWith('eyJ')) return 'eyJ'
  return key.slice(0, 8)
}

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

function extensionFromMimeType(mimeType) {
  switch (mimeType) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
      return 'jpg'
    case 'image/jpg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    default:
      return 'png'
  }
}

async function ensureIconBucket(client) {
  try {
    const { data } = await client.storage.getBucket(ICON_BUCKET)
    if (data) return
  } catch {
    // Bucket does not exist yet.
  }

  try {
    const { error } = await client.storage.createBucket(ICON_BUCKET, { public: true })
    if (error && !/already exists/i.test(error.message || '')) {
      throw error
    }
  } catch (error) {
    if (!/already exists/i.test(error.message || '')) {
      throw error
    }
  }
}

async function resolveFaviconUrl(websiteUrl) {
  const fallback = new URL('/favicon.ico', websiteUrl).href

  try {
    const response = await fetch(websiteUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!response.ok) return fallback

    const html = await response.text()
    const iconRegex = /<link[^>]+rel=["'][^"']*(?:icon|shortcut icon|apple-touch-icon)[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/gi
    const matches = [...html.matchAll(iconRegex)]

    for (const match of matches) {
      try {
        return new URL(match[1], websiteUrl).href
      } catch {
        // Continue to the next candidate.
      }
    }
  } catch {
    // Fall back to the conventional favicon path.
  }

  return fallback
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    console.log('create-app runtime diagnostics', {
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceKey: Boolean(supabaseServiceKey),
      hasAnonKey: Boolean(supabaseAnonKey),
      serviceKeyClass: describeSupabaseKey(supabaseServiceKey),
      anonKeyClass: describeSupabaseKey(supabaseAnonKey),
      nodeVersion: process?.versions?.node || null,
      hasNodeWebSocket: Boolean(nodeWebSocket),
    })

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      realtime: nodeWebSocket ? { transport: nodeWebSocket } : undefined,
    })

    // 1. Authenticate user via Supabase JWT
    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
    }
    const token = authHeader.replace('Bearer ', '')

    if (!supabaseAnonKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing Supabase anon key' }) }
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      realtime: nodeWebSocket ? { transport: nodeWebSocket } : undefined,
    })

    const authResult = await userClient.auth.getUser()
    const { data: { user }, error: authError } = authResult
    console.log('create-app auth.getUser result', authResult)

    if (authError || !user) {
      console.error('create-app auth failure', { authError, user })
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token' }) }
    }

    // 2. Parse and validate body
    let body
    try {
      body = JSON.parse(event.body)
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }
    }

    const { app_name, website_url, package_name, icon_color, icon_source, icon_data_url } = body

    if (!app_name || !website_url || !package_name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: app_name, website_url, package_name' }),
      }
    }

    // Validate URL
    try {
      const url = new URL(website_url)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid website URL' }) }
    }

    // Validate package name
    if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(package_name)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid package name format' }) }
    }

    // 3. Check package name uniqueness
    const { data: existing, error: existingError } = await userClient
      .from('apps')
      .select('id')
      .eq('package_name', package_name)
      .maybeSingle()

    if (existingError) {
      console.error('create-app package lookup error', existingError)
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to verify package name' }) }
    }

    if (existing) {
      return { statusCode: 409, headers, body: JSON.stringify({ error: 'Package name already in use. Choose another.' }) }
    }

    // 4. Check build quota (free plan: 3 builds/month)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyBuilds, error: monthlyBuildsError } = await userClient
      .from('builds')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    if (monthlyBuildsError) {
      console.error('create-app monthly build lookup error', monthlyBuildsError)
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to verify build quota' }) }
    }

    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('create-app profile lookup error', profileError)
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to load profile' }) }
    }

    const quotas = { free: 3, pro: 25, agency: 999 }
    const userPlan = profile?.plan || 'free'
    const quota = quotas[userPlan] || 3

    if (monthlyBuilds >= quota) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: `Monthly build limit (${quota}) reached. Upgrade your plan.` }),
      }
    }

    const resolvedIconSource = icon_source === 'upload' ? 'upload' : 'favicon'
    let resolvedIconUrl = resolvedIconSource === 'favicon' ? await resolveFaviconUrl(website_url.trim()) : null

    // 5. Insert app record
    const { data: app, error: appError } = await userClient
      .from('apps')
      .insert({
        user_id: user.id,
        app_name: app_name.trim(),
        website_url: website_url.trim(),
        package_name: package_name.trim(),
        icon_color: icon_color || '#6366f1',
        icon_source: resolvedIconSource,
        icon_url: resolvedIconUrl,
      })
      .select()
      .single()

    console.error('create-app app insert result', { app, appError })
    if (appError) {
      console.error('App insert error:', appError)
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create app record' }) }
    }

    if (resolvedIconSource === 'upload') {
      if (!icon_data_url) {
        await adminClient.from('apps').delete().eq('id', app.id)
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing uploaded icon data' }) }
      }

      const parsed = parseDataUrl(icon_data_url)
      if (!parsed) {
        await adminClient.from('apps').delete().eq('id', app.id)
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid icon image data' }) }
      }

      try {
        await ensureIconBucket(adminClient)
        const iconPath = `apps/${user.id}/${app.id}/icon.${extensionFromMimeType(parsed.mimeType)}`

        const { error: uploadError } = await adminClient.storage
          .from(ICON_BUCKET)
          .upload(iconPath, parsed.buffer, {
            contentType: parsed.mimeType,
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: publicUrl } = adminClient.storage.from(ICON_BUCKET).getPublicUrl(iconPath)
        resolvedIconUrl = publicUrl.publicUrl

        const { error: updateError } = await userClient
          .from('apps')
          .update({ icon_url: resolvedIconUrl, icon_source: 'upload' })
          .eq('id', app.id)

        if (updateError) {
          throw updateError
        }
      } catch (error) {
        console.error('Icon upload error:', error)
        await userClient.from('apps').delete().eq('id', app.id)
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to upload app icon' }) }
      }
    }

    // 6. Insert build record
    const { data: build, error: buildError } = await userClient
      .from('builds')
      .insert({
        app_id: app.id,
        user_id: user.id,
        status: 'queued',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    console.error('create-app build insert result', { build, buildError })
    if (buildError) {
      console.error('Build insert error:', buildError)
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create build record' }) }
    }

    // 7. Trigger GitHub Actions via repository_dispatch
    const dispatchPayload = {
      event_type: 'build-apk',
      client_payload: {
        build_id: build.id,
        app_id: app.id,
        user_id: user.id,
        app_name: app_name.trim(),
        website_url: website_url.trim(),
        package_name: package_name.trim(),
        icon_color: icon_color || '#6366f1',
        icon_source: resolvedIconSource,
        icon_url: resolvedIconUrl,
        callback_url: `${process.env.URL}/.netlify/functions/update-build`,
        callback_secret: internalSecret,
      },
    }

    const ghResponse = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify(dispatchPayload),
      }
    )

    if (!ghResponse.ok) {
      const ghError = await ghResponse.text()
      console.error('GitHub dispatch error:', ghError)
      // Update build to failed
      await userClient.from('builds').update({ status: 'failed', error_message: 'Failed to trigger GitHub Actions' }).eq('id', build.id)
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to trigger build pipeline' }) }
    }

    // 8. Create notification
    await userClient.from('notifications').insert({
      user_id: user.id,
      title: 'Build Started',
      message: `Your app "${app_name}" is being built. This usually takes 3-5 minutes.`,
      type: 'info',
    })

    // 9. Increment profile builds_count
    await userClient.rpc('increment_builds_count', { user_id_param: user.id })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        app_id: app.id,
        build_id: build.id,
        message: 'App created and build triggered successfully',
      }),
    }
  } catch (err) {
    console.error('create-app error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
