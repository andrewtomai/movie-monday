import { Routes, Route, Navigate } from 'react-router-dom'
import { AttendeeSelectPage } from './pages/AttendeeSelectPage'
import { RankingsPage } from './pages/RankingsPage'
import { RollingPoolPage } from './pages/RollingPoolPage'
import { VotingPoolPage } from './pages/VotingPoolPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AttendeeSelectPage />} />
      <Route path="/rankings" element={<RankingsPage />} />
      <Route path="/rolling-pool" element={<RollingPoolPage />} />
      <Route path="/voting-pool" element={<VotingPoolPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
