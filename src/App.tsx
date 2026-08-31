import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import VotingPage from './pages/VotingPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminPage from './pages/AdminPage'
import { isAuthenticated } from './lib/session'

function ProtectedVote() {
  if (!isAuthenticated()) return <Navigate to="/" replace />
  return <VotingPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<LoginPage />} />
      <Route path="/vote"         element={<ProtectedVote />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />
      <Route path="/admin"        element={<AdminPage />} />
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
  )
}
