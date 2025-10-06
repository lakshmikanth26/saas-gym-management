import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function AdminStaff() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-600 mt-1">Manage your gym staff</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            No staff members found. Add your first staff member to get started.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

