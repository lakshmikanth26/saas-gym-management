import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, generateSlug } from '@/lib/utils'
import { isSlugAvailable } from '@/lib/gym-context'
import { openCashfreeModal, verifyPaymentAndCreateGym } from '@/lib/cashfree'

const plans = [
  { value: 'monthly', label: 'Monthly', price: 2999, duration: '1 month' },
  { value: 'quarterly', label: 'Quarterly', price: 7999, duration: '3 months' },
  { value: 'half_yearly', label: 'Half Yearly', price: 14999, duration: '6 months' },
  { value: 'yearly', label: 'Yearly', price: 27999, duration: '1 year' },
]

export default function RegisterGym() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultPlan = searchParams.get('plan') || 'quarterly'

  const [formData, setFormData] = useState({
    gymName: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    password: '',
    confirmPassword: '',
    planType: defaultPlan,
  })

  const [errors, setErrors] = useState({})
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null) // 'success', 'failed', or null
  const [paymentMessage, setPaymentMessage] = useState('')
  const [registrationData, setRegistrationData] = useState(null)

  const selectedPlan = plans.find(p => p.value === formData.planType)

  // Auto-generate slug from gym name
  useEffect(() => {
    if (formData.gymName && !formData.slug) {
      const generatedSlug = generateSlug(formData.gymName)
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.gymName, formData.slug])

  // Check slug availability
  useEffect(() => {
    const checkSlug = async () => {
      if (formData.slug && formData.slug.length >= 3) {
        setSlugChecking(true)
        try {
          const available = await isSlugAvailable(formData.slug)
          setSlugAvailable(available)
        } catch (error) {
          // If Supabase is not configured, assume slug is available for testing
          console.warn('Slug check failed (Supabase not configured):', error)
          setSlugAvailable(true)
        }
        setSlugChecking(false)
      } else {
        setSlugAvailable(null)
      }
    }

    const timer = setTimeout(checkSlug, 500)
    return () => clearTimeout(timer)
  }, [formData.slug])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.gymName) newErrors.gymName = 'Gym name is required'
    if (!formData.slug) newErrors.slug = 'Slug is required'
    if (!slugAvailable) newErrors.slug = 'This slug is not available'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number'
    }
    if (!formData.adminName) newErrors.adminName = 'Admin name is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Open Cashfree payment modal
      await openCashfreeModal({
        amount: selectedPlan.price,
        customerName: formData.adminName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        notes: {
          gym_name: formData.gymName,
          plan_type: formData.planType,
        },
        onSuccess: async (paymentData) => {
          try {
            // Verify payment and create gym
            const result = await verifyPaymentAndCreateGym({
              order_id: paymentData.order_id,
              payment_id: paymentData.payment_id,
              gym_data: {
                name: formData.gymName,
                slug: formData.slug,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                admin_name: formData.adminName,
                password: formData.password,
              },
              plan_type: formData.planType,
            })

            if (result.success) {
              setPaymentStatus('success')
              setPaymentMessage(`🎉 Payment Successful! Your gym "${formData.gymName}" has been registered.`)
              setRegistrationData({
                slug: formData.slug,
                email: formData.email,
                adminName: formData.adminName,
              })
            } else {
              throw new Error(result.error || 'Failed to complete registration')
            }
          } catch (error) {
            console.error('Registration error:', error)
            console.error('Full error details:', error.message)
            setPaymentStatus('failed')
            setPaymentMessage(`Payment successful but registration failed: ${error.message || 'Unknown error'}. Please contact support with your payment details.`)
          } finally {
            setLoading(false)
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error)
          setPaymentStatus('failed')
          setPaymentMessage('Payment failed. Please try again or contact support if the issue persists.')
          setLoading(false)
        },
      })
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">GymSaaS</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Payment Status Messages */}
            {paymentStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <Card className="border-green-500 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-green-900">
                        Registration Successful!
                      </h2>
                      <p className="text-green-800">{paymentMessage}</p>
                      {registrationData && (
                        <div className="bg-white rounded-lg p-4 mt-4 text-left">
                          <h3 className="font-semibold mb-2">Your Login Details:</h3>
                          <p className="text-sm"><strong>Gym URL:</strong> yourdomain.com/{registrationData.slug}</p>
                          <p className="text-sm"><strong>Admin Email:</strong> {registrationData.email}</p>
                          <p className="text-sm"><strong>Admin Name:</strong> {registrationData.adminName}</p>
                          <p className="text-sm text-gray-600 mt-2">Check your email for login credentials.</p>
                        </div>
                      )}
                      <div className="flex gap-4 justify-center mt-6">
                        <Button 
                          onClick={() => registrationData && navigate(`/${registrationData.slug}/admin/dashboard`)}
                          size="lg"
                        >
                          Go to Admin Dashboard
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate('/')}
                          size="lg"
                        >
                          Back to Home
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {paymentStatus === 'failed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <Card className="border-red-500 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-3xl">✕</span>
                      </div>
                      <h2 className="text-2xl font-bold text-red-900">
                        Payment Failed
                      </h2>
                      <p className="text-red-800">{paymentMessage}</p>
                      <div className="flex gap-4 justify-center mt-6">
                        <Button 
                          onClick={() => {
                            setPaymentStatus(null)
                            setPaymentMessage('')
                          }}
                          size="lg"
                        >
                          Try Again
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate('/')}
                          size="lg"
                        >
                          Back to Home
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Register Your Gym
              </h1>
              <p className="text-gray-600">
                Start your journey to better gym management in minutes
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Registration Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Gym Information</CardTitle>
                    <CardDescription>
                      Tell us about your gym and create your admin account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Gym Details */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Gym Details</h3>
                        
                        <div>
                          <Label htmlFor="gymName">Gym Name *</Label>
                          <Input
                            id="gymName"
                            name="gymName"
                            value={formData.gymName}
                            onChange={handleChange}
                            placeholder="e.g., Iron Fitness Center"
                          />
                          {errors.gymName && (
                            <p className="text-sm text-red-600 mt-1">{errors.gymName}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="slug">
                            URL Slug * 
                            <span className="text-sm text-gray-500 ml-2">
                              (Your gym will be at: yourdomain.com/{formData.slug || 'your-slug'})
                            </span>
                          </Label>
                          <Input
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="e.g., iron-fitness"
                          />
                          {slugChecking && (
                            <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
                          )}
                          {!slugChecking && slugAvailable === true && formData.slug && (
                            <p className="text-sm text-green-600 mt-1 flex items-center">
                              <Check className="h-4 w-4 mr-1" /> Available!
                            </p>
                          )}
                          {!slugChecking && slugAvailable === false && (
                            <p className="text-sm text-red-600 mt-1">Not available</p>
                          )}
                          {errors.slug && (
                            <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="gym@example.com"
                            />
                            {errors.email && (
                              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="9876543210"
                            />
                            {errors.phone && (
                              <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Main Street, City"
                          />
                        </div>
                      </div>

                      {/* Admin Account */}
                      <div className="space-y-4 border-t pt-6">
                        <h3 className="font-semibold text-lg">Admin Account</h3>
                        
                        <div>
                          <Label htmlFor="adminName">Full Name *</Label>
                          <Input
                            id="adminName"
                            name="adminName"
                            value={formData.adminName}
                            onChange={handleChange}
                            placeholder="John Doe"
                          />
                          {errors.adminName && (
                            <p className="text-sm text-red-600 mt-1">{errors.adminName}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 8 characters"
                          />
                          {errors.password && (
                            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password *</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                          />
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>

                      {/* Plan Selection */}
                      <div className="space-y-4 border-t pt-6">
                        <h3 className="font-semibold text-lg">Select Plan</h3>
                        
                        <div>
                          <Label htmlFor="planType">Plan Type</Label>
                          <Select 
                            value={formData.planType} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, planType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {plans.map(plan => (
                                <SelectItem key={plan.value} value={plan.value}>
                                  {plan.label} - {formatCurrency(plan.price)} ({plan.duration})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={loading || !slugAvailable}
                      >
                        {loading ? 'Processing...' : `Proceed to Payment - ${formatCurrency(selectedPlan.price)}`}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        By registering, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-semibold">{selectedPlan.label}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold">{selectedPlan.duration}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Price</span>
                        <span className="font-semibold">{formatCurrency(selectedPlan.price)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-indigo-600">{formatCurrency(selectedPlan.price)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                      <p className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        Instant activation
                      </p>
                      <p className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        Free setup assistance
                      </p>
                      <p className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        24/7 customer support
                      </p>
                      <p className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        Secure payment via Razorpay
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

