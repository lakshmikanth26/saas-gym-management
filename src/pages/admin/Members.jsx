import { useEffect, useState } from 'react'
import { useGym } from '@/hooks/useGym'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, QrCode, DollarSign, UserCheck } from 'lucide-react'
import QRCode from 'qrcode'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminMembers() {
  const { gym } = useGym()
  const [members, setMembers] = useState([])
  const [membershipPlans, setMembershipPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    if (gym) {
      fetchMembers()
      fetchMembershipPlans()
    }
  }, [gym])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          membership_plan:membership_plans(name, price, duration_days)
        `)
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembershipPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('gym_id', gym.id)
        .eq('is_active', true)

      if (error) throw error
      setMembershipPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const generateQRCode = async (memberId) => {
    try {
      const qrData = `${gym.id}:${memberId}`
      const url = await QRCode.toDataURL(qrData)
      setQrCodeUrl(url)
      setSelectedMember(members.find(m => m.id === memberId))
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      expired: 'destructive',
      cancelled: 'outline',
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Manage your gym members</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Create a new member profile and assign a membership plan
              </DialogDescription>
            </DialogHeader>
            <AddMemberForm 
              gym={gym} 
              plans={membershipPlans}
              onSuccess={() => {
                setShowAddDialog(false)
                fetchMembers()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Members ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading members...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No members found. Add your first member to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-semibold text-gray-600">Member</th>
                    <th className="pb-3 font-semibold text-gray-600">Contact</th>
                    <th className="pb-3 font-semibold text-gray-600">Plan</th>
                    <th className="pb-3 font-semibold text-gray-600">Status</th>
                    <th className="pb-3 font-semibold text-gray-600">Membership</th>
                    <th className="pb-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-gray-900">{member.full_name}</p>
                          <p className="text-sm text-gray-500">ID: {member.id.substring(0, 8)}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm text-gray-900">{member.email}</p>
                          <p className="text-sm text-gray-500">{member.phone}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-gray-900">
                          {member.membership_plan?.name || 'No Plan'}
                        </p>
                      </td>
                      <td className="py-4">
                        {getStatusBadge(member.membership_status)}
                      </td>
                      <td className="py-4">
                        {member.membership_end ? (
                          <div>
                            <p className="text-sm text-gray-900">
                              Ends: {formatDate(member.membership_end)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Not assigned</p>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateQRCode(member.id)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      {qrCodeUrl && selectedMember && (
        <Dialog open={!!qrCodeUrl} onOpenChange={() => setQrCodeUrl('')}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Member QR Code</DialogTitle>
              <DialogDescription>
                {selectedMember.full_name}'s attendance QR code
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              <Button onClick={() => {
                const link = document.createElement('a')
                link.download = `${selectedMember.full_name}-qr.png`
                link.href = qrCodeUrl
                link.click()
              }}>
                Download QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function AddMemberForm({ gym, plans, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    membership_plan_id: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create member
      const memberData = {
        gym_id: gym.id,
        ...formData,
        qr_code: `${gym.id}:${Date.now()}`,
      }

      const { data: member, error } = await supabase
        .from('members')
        .insert(memberData)
        .select()
        .single()

      if (error) throw error

      alert('Member added successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error adding member:', error)
      alert('Failed to add member. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="membership_plan_id">Membership Plan</Label>
          <Select value={formData.membership_plan_id} onValueChange={(value) => setFormData({ ...formData, membership_plan_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - {formatCurrency(plan.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
          <Input
            id="emergency_contact"
            value={formData.emergency_contact}
            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="emergency_phone">Emergency Phone</Label>
          <Input
            id="emergency_phone"
            value={formData.emergency_phone}
            onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Adding Member...' : 'Add Member'}
      </Button>
    </form>
  )
}

