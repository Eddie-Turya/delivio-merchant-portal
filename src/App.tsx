import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { APIKeysPage } from './pages/APIKeysPage'
import { WebhooksPage } from './pages/WebhooksPage'
import { DocsPage } from './pages/DocsPage'
import { PlaygroundPage } from './pages/PlaygroundPage'
import { CollectPage } from './pages/CollectPage'
import { AccountPage } from './pages/AccountPage'
import { DisbursementPage } from './pages/DisbursementPage'
import { BulkPage } from './pages/BulkPage'
import { PaymentDetailPage } from './pages/PaymentDetailPage'
import { PaymentLinksPage } from './pages/PaymentLinksPage'
import { TeamPage } from './pages/TeamPage'
import { SettlementsPage } from './pages/SettlementsPage'
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
        <Route path="/collect" element={<Guard><CollectPage /></Guard>} />
        <Route path="/playground" element={<Guard><PlaygroundPage /></Guard>} />
        <Route path="/account" element={<Guard><AccountPage /></Guard>} />
        <Route path="/disbursement" element={<Guard><DisbursementPage /></Guard>} />
        <Route path="/bulk" element={<Guard><BulkPage /></Guard>} />
        <Route path="/payments/:id" element={<Guard><PaymentDetailPage /></Guard>} />
        <Route path="/payment-links" element={<Guard><PaymentLinksPage /></Guard>} />
        <Route path="/team" element={<Guard><TeamPage /></Guard>} />
        <Route path="/settlements" element={<Guard><SettlementsPage /></Guard>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </EnvProvider>
  )
}
