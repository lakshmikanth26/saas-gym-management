import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function CustomerAttendance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
        <p className="text-gray-600 mt-1">View your gym check-in history</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Calendar className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center">
            Your attendance history will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

