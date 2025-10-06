import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Plus } from 'lucide-react'

export default function CustomerGoals() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fitness Goals</h1>
          <p className="text-gray-600 mt-1">Track your fitness progress</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Target className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center">
            Set your first fitness goal to start tracking progress
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

