import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGym } from '@/hooks/useGym'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Briefcase, 
  CreditCard, 
  BarChart3, 
  Settings,
  LogOut,
  Dumbbell
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { name: 'Members', href: 'members', icon: Users },
  { name: 'Trainers', href: 'trainers', icon: UserPlus },
  { name: 'Staff', href: 'staff', icon: Briefcase },
  { name: 'Plans', href: 'plans', icon: CreditCard },
  { name: 'Analytics', href: 'analytics', icon: BarChart3 },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { gym } = useGym()

  const handleSignOut = async () => {
    await signOut()
    navigate(`/${gym?.slug}/login`)
  }

  const isActive = (href) => {
    return location.pathname.includes(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b">
            <Dumbbell className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{gym?.name}</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={`/${gym?.slug}/admin/${item.href}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    active
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.user_metadata?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

