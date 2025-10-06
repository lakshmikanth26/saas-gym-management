import { useEffect, useState } from 'react'
import { useGym } from '@/hooks/useGym'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const { gym } = useGym()
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    todayAttendance: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState([])
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    if (gym) {
      fetchDashboardData()
    }
  }, [gym])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch total members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)

      // Fetch active members
      const { count: activeMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)
        .eq('membership_status', 'active')

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { count: todayAttendance } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)
        .gte('check_in', `${today}T00:00:00`)
        .lte('check_in', `${today}T23:59:59`)

      // Fetch monthly revenue
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('gym_id', gym.id)
        .eq('payment_status', 'completed')
        .gte('payment_date', startOfMonth)

      const monthlyRevenue = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        todayAttendance: todayAttendance || 0,
        monthlyRevenue,
      })

      // Fetch attendance data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date.toISOString().split('T')[0]
      })

      const attendancePromises = last7Days.map(async (date) => {
        const { count } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gym.id)
          .gte('check_in', `${date}T00:00:00`)
          .lte('check_in', `${date}T23:59:59`)

        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          attendance: count || 0,
        }
      })

      const attendanceResults = await Promise.all(attendancePromises)
      setAttendanceData(attendanceResults)

      // Fetch revenue data for last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString(),
        }
      })

      const revenuePromises = last6Months.map(async ({ month, start, end }) => {
        const { data } = await supabase
          .from('payments')
          .select('amount')
          .eq('gym_id', gym.id)
          .eq('payment_status', 'completed')
          .gte('payment_date', start)
          .lte('payment_date', end)

        const revenue = data?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0

        return {
          month,
          revenue: parseFloat(revenue.toFixed(2)),
        }
      })

      const revenueResults = await Promise.all(revenuePromises)
      setRevenueData(revenueResults)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your gym today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Members
            </CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalMembers}</div>
            <p className="text-sm text-gray-600 mt-1">Registered members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Members
            </CardTitle>
            <UserCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeMembers}</div>
            <p className="text-sm text-gray-600 mt-1">With active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Attendance
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.todayAttendance}</div>
            <p className="text-sm text-gray-600 mt-1">Check-ins today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-sm text-gray-600 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <p className="text-sm text-gray-600">Last 7 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  name="Check-ins"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <p className="text-sm text-gray-600">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  fill="#6366f1" 
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
              <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add New Member</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
              <UserCheck className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Record Attendance</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
              <DollarSign className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Process Payment</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

