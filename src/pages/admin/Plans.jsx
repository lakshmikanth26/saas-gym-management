import { useEffect, useState } from 'react'
import { useGym } from '@/hooks/useGym'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function AdminPlans() {
  const { gym } = useGym()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (gym) {
      fetchPlans()
    }
  }, [gym])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('gym_id', gym.id)
        .order('price', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-600 mt-1">Manage your membership plans</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-500">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No plans found. Add your first membership plan to get started.
          </div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.is_active ? (
                    <Badge>Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {formatCurrency(plan.price)}
                  </div>
                  <p className="text-sm text-gray-600">{plan.duration_days} days</p>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    {plan.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

