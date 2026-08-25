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
  if (!res.ok) {
    const msg = typeof data.error === 'string' ? data.error : (data.error?.message || `HTTP ${res.status}`)
    throw new Error(msg)
  }
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
  stats: (envType?: 'live' | 'sandbox') => req<any>('GET', `/stats${envType ? `?envType=${envType}` : ''}`),
  payments: (params?: { limit?: number; offset?: number; status?: string; search?: string; envType?: 'live' | 'sandbox'; from?: string; to?: string }) => {
    const qs = new URLSearchParams()
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.offset) qs.set('offset', String(params.offset))
    if (params?.status && params.status !== 'ALL') qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    if (params?.envType) qs.set('envType', params.envType)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
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

  updateMe: (patch: { name?: string; currentPassword?: string; newPassword?: string }) =>
    req<any>('PATCH', '/me', patch),
  webhookLogs: (webhookId: string) => req<any>('GET', `/webhooks/${webhookId}/logs`),

  paymentDetail: (id: string) => req<any>('GET', `/payments/${id}`),
  refundPayment: (id: string, reason?: string) => req<any>('POST', `/payments/${id}/refund`, { reason }),
  exportPayments: (params?: { status?: string; search?: string; envType?: string; from?: string; to?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status && params.status !== 'ALL') qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    if (params?.envType) qs.set('envType', params.envType)
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    const q = qs.toString()
    return fetch(`/admin/portal/payments/export${q ? `?${q}` : ''}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('portalToken')}` }
    }).then(r => r.blob())
  },

  paymentLinks: () => req<any>('GET', '/payment-links'),
  deletePaymentLink: (id: string) => req<any>('DELETE', `/payment-links/${id}`),

  team: () => req<any>('GET', '/team'),
  inviteTeamMember: (email: string, name: string, role: string) => req<any>('POST', '/team', { email, name, role }),
  removeTeamMember: (id: string) => req<any>('DELETE', `/team/${id}`),

  settlements: () => req<any>('GET', '/settlements'),

  analytics: (params?: { days?: number; envType?: string }) => {
    const qs = new URLSearchParams()
    if (params?.days) qs.set('days', String(params.days))
    if (params?.envType) qs.set('envType', params.envType)
    const q = qs.toString()
    return req<any>('GET', `/analytics${q ? `?${q}` : ''}`)
  },
  customers: (params?: { limit?: number; search?: string; envType?: string }) => {
    const qs = new URLSearchParams()
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.search) qs.set('search', params.search)
    if (params?.envType) qs.set('envType', params.envType)
    const q = qs.toString()
    return req<any>('GET', `/customers${q ? `?${q}` : ''}`)
  },
  auditLogs: (limit?: number) => req<any>('GET', `/audit-logs${limit ? `?limit=${limit}` : ''}`),
  onboarding: () => req<any>('GET', '/onboarding'),

  // Collect
  collectUssd: (body: { phone: string; amount_minor: number; currency?: string; description?: string }) =>
    req<any>('POST', '/collect/ussd', body),
  collectStatus: (paymentId: string) => req<any>('GET', `/collect/status/${paymentId}`),
  createPaymentLink: (body: { amount_minor: number; currency?: string; description?: string; expires_in_hours?: number }) =>
    req<any>('POST', '/collect/link', body),
}
