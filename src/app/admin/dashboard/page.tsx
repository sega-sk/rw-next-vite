'use client' 
import { useAuth } from '../providers/AuthProvider'
export function Dashboard() {
  const { user, logout } = useAuth()

return (

export default function Page() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}