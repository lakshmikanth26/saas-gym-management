import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGym } from '@/hooks/useGym'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Trophy, Target, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { gym } = useGym()
  const [memberData, setMemberData] = useState(null)
  const [stats, setStats] = useState({
    totalAttendance: 0,
    monthlyAttendance: 0,
    badges: [],
    goals: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && gym) {
      fetchMemberData()
    }
  }, [user, gym])

  const fetchMemberData = async () => {
    try {
      setLoading(true)

      // Fetch member profile
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select(`
          *,
          membership_plan:membership_plans(name, duration_days),
          assigned_trainer:trainers(full_name)
        `)
        .eq('gym_id', gym.id)
        .eq('user_id', user.id)
        .single()

      if (memberError) throw memberError
      setMemberData(member)

      // Fetch attendance stats
      const { count: totalAttendance } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id)

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { count: monthlyAttendance } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id)
        .gte('check_in', startOfMonth)

      // Fetch badges
      const { data: badges } = await supabase
        .from('member_badges')
        .select('*')
        .eq('member_id', member.id)
        .order('earned_at', { ascending: false })
        .limit(3)

      // Fetch goals
      const { data: goals } = await supabase
        .from('member_goals')
        .select('*')
        .eq('member_id', member.id)
        .eq('status', 'in_progress')

      setStats({
        totalAttendance: totalAttendance || 0,
        monthlyAttendance: monthlyAttendance || 0,
        badges: badges || [],
        goals: goals || [],
      })
    } catch (error) {
      console.error('Error fetching member data:', error)
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

  if (!memberData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
        <p className="text-gray-600">Your member profile is being set up. Please contact the gym admin.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {memberData.full_name}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your fitness journey overview</p>
      </div>

      {/* Membership Status */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {memberData.membership_plan?.name || 'No Active Plan'}
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Status: <Badge>{memberData.membership_status}</Badge>
                </p>
                {memberData.membership_end && (
                  <p className="text-sm text-gray-600">
                    Valid until: <span className="font-medium">{formatDate(memberData.membership_end)}</span>
                  </p>
                )}
                {memberData.assigned_trainer && (
                  <p className="text-sm text-gray-600">
                    Trainer: <span className="font-medium">{memberData.assigned_trainer.full_name}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Attendance
            </CardTitle>
            <Calendar className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalAttendance}</div>
            <p className="text-sm text-gray-600 mt-1">All-time check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.monthlyAttendance}</div>
            <p className="text-sm text-gray-600 mt-1">Days this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Badges Earned
            </CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.badges.length}</div>
            <p className="text-sm text-gray-600 mt-1">Total achievements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Goals
            </CardTitle>
            <Target className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.goals.length}</div>
            <p className="text-sm text-gray-600 mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {stats.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              {stats.badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center">
                  <Badge variant={badge.badge_type} className="text-lg px-4 py-2">
                    {badge.badge_type.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-gray-600 mt-2">
                    {badge.days_attended} days
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

