import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useGym } from './useGym'

export function useUserRole() {
  const { user } = useAuth()
  const { gym } = useGym()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserRole() {
      if (!user || !gym) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('gym_members')
          .select('role')
          .eq('user_id', user.id)
          .eq('gym_id', gym.id)
          .single()

        if (error) {
          console.error('Error fetching user role:', error)
          setRole(null)
        } else {
          setRole(data?.role || null)
        }
      } catch (err) {
        console.error('Error:', err)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user, gym])

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    isTrainer: role === 'trainer',
    isMember: role === 'member',
    hasAccess: (allowedRoles) => allowedRoles.includes(role),
  }
}

