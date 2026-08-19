const BASE = '/admin/portal'

function getToken() { return localStorage.getItem('portalToken') }
function setToken(t: string) { localStorage.setItem('portalToken', t) }
function clearToken() { localStorage.removeItem('portalToken') }

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return undefined as T
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  isLoggedIn: () => !!getToken(),
  logout: clearToken,

  login: async (email: string, password: string) => {
    const data = await req<any>('POST', '/auth/login', { email, password })
    setToken(data.token)
    return data
  },
  me: () => req<any>('GET', '/me'),
  stats: () => req<any>('GET', '/stats'),
  payments: (params?: { limit?: number; offset?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.offset) qs.set('offset', String(params.offset))
    if (params?.status && params.status !== 'ALL') qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    const q = qs.toString()
    return req<any>('GET', `/payments${q ? `?${q}` : ''}`)
  },
  apiKeys: () => req<any>('GET', '/api-keys'),
  rotateKey: (envId: string) => req<any>('POST', `/api-keys/${envId}/rotate`),
  webhooks: () => req<any>('GET', '/webhooks'),
  createWebhook: (url: string, events: string[]) => req<any>('POST', '/webhooks', { url, events }),
  updateWebhook: (id: string, patch: { url?: string; events?: string[]; enabled?: boolean }) =>
    req<any>('PATCH', `/webhooks/${id}`, patch),
  deleteWebhook: (id: string) => req<any>('DELETE', `/webhooks/${id}`),
}
