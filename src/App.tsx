import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { APIKeysPage } from './pages/APIKeysPage'
import { WebhooksPage } from './pages/WebhooksPage'
import { DocsPage } from './pages/DocsPage'
import { PlaygroundPage } from './pages/PlaygroundPage'
import { EnvProvider } from './context/EnvContext'
import { api } from './api'

function Guard({ children }: { children: React.ReactNode }) {
  return api.isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <EnvProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Guard><DashboardPage /></Guard>} />
        <Route path="/payments" element={<Guard><PaymentsPage /></Guard>} />
        <Route path="/api-keys" element={<Guard><APIKeysPage /></Guard>} />
        <Route path="/webhooks" element={<Guard><WebhooksPage /></Guard>} />
        <Route path="/docs" element={<Guard><DocsPage /></Guard>} />
        <Route path="/playground" element={<Guard><PlaygroundPage /></Guard>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </EnvProvider>
  )
}
