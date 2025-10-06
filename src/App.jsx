import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useGym } from './hooks/useGym'

// Pages
import LandingPage from './pages/LandingPage'
import RegisterGym from './pages/RegisterGym'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminMembers from './pages/admin/Members'
import AdminTrainers from './pages/admin/Trainers'
import AdminStaff from './pages/admin/Staff'
import AdminPlans from './pages/admin/Plans'
import AdminAnalytics from './pages/admin/Analytics'
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerAttendance from './pages/customer/Attendance'
import CustomerGoals from './pages/customer/Goals'
import CustomerTrainers from './pages/customer/Trainers'
import CustomerBadges from './pages/customer/Badges'

// Layout
import AdminLayout from './components/layouts/AdminLayout'
import CustomerLayout from './components/layouts/CustomerLayout'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const { gym } = useGym()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || !gym) {
    return <Navigate to={gym ? `/${gym.slug}/login` : '/login'} />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterGym />} />
      
      {/* Gym-specific login */}
      <Route path="/:gymSlug/login" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
      <Route
        path="/:gymSlug/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="trainers" element={<AdminTrainers />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Customer routes */}
      <Route
        path="/:gymSlug/customer"
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="attendance" element={<CustomerAttendance />} />
        <Route path="goals" element={<CustomerGoals />} />
        <Route path="trainers" element={<CustomerTrainers />} />
        <Route path="badges" element={<CustomerBadges />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App

