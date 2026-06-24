const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const githubToken = process.env.GITHUB_TOKEN
const githubOwner = process.env.GITHUB_OWNER
const githubRepo = process.env.GITHUB_REPO

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
    // Auth
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

    // Get build from DB
    const { data: build, error: buildError } = await supabase
      .from('builds')
      .select('*, apps(*)')
      .eq('id', buildId)
      .eq('user_id', user.id)
      .single()

    if (buildError || !build) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Build not found' }) }
    }

    // If already terminal, return DB data
    if (['complete', 'failed'].includes(build.status)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ build }),
      }
    }

    // Poll GitHub for run status if we have run ID
    let githubStatus = null
    if (build.github_run_id && githubToken) {
      try {
        const ghRes = await fetch(
          `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/runs/${build.github_run_id}`,
          {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        )
        if (ghRes.ok) {
          const runData = await ghRes.json()
          githubStatus = {
            status: runData.status,
            conclusion: runData.conclusion,
            html_url: runData.html_url,
          }

          // Sync status to DB if GitHub shows completion
          if (runData.status === 'completed' && build.status !== 'complete' && build.status !== 'failed') {
            const newStatus = runData.conclusion === 'success' ? 'complete' : 'failed'
            await supabase
              .from('builds')
              .update({
                status: newStatus,
                completed_at: new Date().toISOString(),
                ...(runData.conclusion !== 'success' && { error_message: 'Build failed in GitHub Actions. Check logs.' }),
              })
              .eq('id', buildId)

            build.status = newStatus
          }
        }
      } catch (ghErr) {
        console.error('GitHub API error:', ghErr)
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ build, github: githubStatus }),
    }
  } catch (err) {
    console.error('build-status error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
