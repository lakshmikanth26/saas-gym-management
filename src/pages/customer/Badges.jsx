import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function CustomerBadges() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Badges</h1>
        <p className="text-gray-600 mt-1">Your fitness achievements and rewards</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Bronze Badge</h4>
                <p className="text-sm text-gray-600">Attend gym 10+ days in a month</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Silver Badge</h4>
                <p className="text-sm text-gray-600">Attend gym 20+ days in a month</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Gold Badge</h4>
                <p className="text-sm text-gray-600">Attend gym 26+ days in a month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earned Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Keep attending the gym to earn your first badge!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

