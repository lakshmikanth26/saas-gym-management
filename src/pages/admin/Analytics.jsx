import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">View detailed analytics and reports</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Advanced Analytics Coming Soon
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Detailed analytics with member retention, revenue forecasting, and more insights will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

