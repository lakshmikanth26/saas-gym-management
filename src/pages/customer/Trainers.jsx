import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function CustomerTrainers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trainers</h1>
        <p className="text-gray-600 mt-1">View and book sessions with trainers</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Users className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center">
            Available trainers will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

