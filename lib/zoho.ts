const ZOHO_TOKEN_URL = 'https://accounts.zoho.in/oauth/v2/token'
const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

let cached: { access_token: string; expires_at: number } | null = null

export async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN
  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing Zoho env: ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET')
  }

  const now = Date.now()
  if (cached && cached.expires_at > now) {
    return cached.access_token
  }

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  })

  const res = await fetch(ZOHO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Zoho token error: ${JSON.stringify(data)}`)
  }

  cached = {
    access_token: data.access_token,
    expires_at: now + REFRESH_INTERVAL_MS,
  }

  return data.access_token
}
