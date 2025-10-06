import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, Users, BarChart3, CreditCard, Calendar, Trophy, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

const pricingPlans = [
  {
    name: 'Monthly',
    price: 2999,
    duration: 'per month',
    features: [
      'Unlimited members',
      'QR code attendance',
      'Payment processing',
      'Basic analytics',
      'Email support',
    ],
    planType: 'monthly',
  },
  {
    name: 'Quarterly',
    price: 7999,
    duration: 'per 3 months',
    savings: '₹1,998 savings',
    features: [
      'Everything in Monthly',
      'Priority support',
      'Advanced analytics',
      'Custom domain',
      'Branded invoices',
    ],
    planType: 'quarterly',
    popular: true,
  },
  {
    name: 'Half Yearly',
    price: 14999,
    duration: 'per 6 months',
    savings: '₹2,995 savings',
    features: [
      'Everything in Quarterly',
      'Dedicated account manager',
      'API access',
      'White-label solution',
      'Custom integrations',
    ],
    planType: 'half_yearly',
  },
  {
    name: 'Yearly',
    price: 27999,
    duration: 'per year',
    savings: '₹7,989 savings',
    features: [
      'Everything in Half Yearly',
      'Premium support',
      'Mobile app branding',
      'Priority feature requests',
      'Free migration assistance',
    ],
    planType: 'yearly',
  },
]

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description: 'Easily manage member profiles, memberships, and track their fitness journey.',
  },
  {
    icon: Calendar,
    title: 'Attendance Tracking',
    description: 'QR code and biometric attendance system for seamless check-ins.',
  },
  {
    icon: CreditCard,
    title: 'Payment Processing',
    description: 'Integrated Razorpay payments with automated invoicing and receipts.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time insights into revenue, attendance trends, and member engagement.',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    description: 'Badges and rewards to keep members motivated and engaged.',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Bank-level security with data encryption and privacy compliance.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">GymSaaS</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition">Pricing</a>
            <a href="#contact" className="text-gray-600 hover:text-indigo-600 transition">Contact</a>
          </nav>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Gym Management
            <br />
            <span className="text-indigo-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            All-in-one platform to manage your gym, track attendance, process payments, 
            and engage members with a beautiful customer portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/register">Start Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </motion.div>

        {/* Demo Video/Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-2xl p-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-24 w-24 text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Gym
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern fitness centers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-indigo-600 mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your gym's needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full relative ${plan.popular ? 'border-indigo-600 border-2 shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>
                      <div className="text-3xl font-bold text-gray-900 mt-4">
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="text-sm text-gray-600">{plan.duration}</div>
                      {plan.savings && (
                        <div className="text-sm text-green-600 font-semibold mt-2">
                          {plan.savings}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Zap className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      asChild 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      <Link to={`/register?plan=${plan.planType}`}>
                        Get Started
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Gym?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of gym owners who are already using our platform to grow their business.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/register">Start Your Free Trial</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold text-white">GymSaaS</span>
              </div>
              <p className="text-sm">
                Modern gym management platform for fitness centers of all sizes.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 GymSaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

