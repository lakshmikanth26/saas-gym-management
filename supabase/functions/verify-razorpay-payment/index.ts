// Supabase Edge Function: Verify Razorpay Payment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      gym_data,
      plan_type
    } = await req.json()

    // Razorpay secret from environment
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret not configured')
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const hmac = createHmac('sha256', razorpayKeySecret)
    hmac.update(text)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature')
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Calculate plan end date
    const planStart = new Date()
    let planEnd = new Date()
    
    switch (plan_type) {
      case 'monthly':
        planEnd.setMonth(planEnd.getMonth() + 1)
        break
      case 'quarterly':
        planEnd.setMonth(planEnd.getMonth() + 3)
        break
      case 'half_yearly':
        planEnd.setMonth(planEnd.getMonth() + 6)
        break
      case 'yearly':
        planEnd.setFullYear(planEnd.getFullYear() + 1)
        break
      default:
        planEnd.setMonth(planEnd.getMonth() + 1)
    }

    // Create gym record
    const { data: gymData, error: gymError } = await supabase
      .from('gyms')
      .insert({
        name: gym_data.name,
        slug: gym_data.slug,
        email: gym_data.email,
        phone: gym_data.phone,
        address: gym_data.address,
        plan_type,
        plan_start: planStart.toISOString(),
        plan_end: planEnd.toISOString(),
        razorpay_payment_id,
        is_active: true,
      })
      .select()
      .single()

    if (gymError) {
      throw new Error(`Failed to create gym: ${gymError.message}`)
    }

    // Create admin user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: gym_data.email,
      password: gym_data.password,
      email_confirm: true,
      user_metadata: {
        full_name: gym_data.admin_name,
        gym_id: gymData.id,
      }
    })

    if (userError) {
      // Rollback gym creation
      await supabase.from('gyms').delete().eq('id', gymData.id)
      throw new Error(`Failed to create admin user: ${userError.message}`)
    }

    // Create gym_member record for admin
    const { error: memberError } = await supabase
      .from('gym_members')
      .insert({
        user_id: userData.user.id,
        gym_id: gymData.id,
        role: 'admin',
      })

    if (memberError) {
      throw new Error(`Failed to create gym member record: ${memberError.message}`)
    }

    // Create default membership plans for the gym
    const defaultPlans = [
      {
        gym_id: gymData.id,
        name: 'Monthly Plan',
        description: 'Access to all gym facilities for 1 month',
        duration_days: 30,
        price: 1500,
        is_active: true,
      },
      {
        gym_id: gymData.id,
        name: 'Quarterly Plan',
        description: 'Access to all gym facilities for 3 months',
        duration_days: 90,
        price: 4000,
        is_active: true,
      },
      {
        gym_id: gymData.id,
        name: 'Half Yearly Plan',
        description: 'Access to all gym facilities for 6 months',
        duration_days: 180,
        price: 7500,
        is_active: true,
      },
      {
        gym_id: gymData.id,
        name: 'Yearly Plan',
        description: 'Access to all gym facilities for 1 year',
        duration_days: 365,
        price: 14000,
        is_active: true,
      },
    ]

    await supabase.from('membership_plans').insert(defaultPlans)

    return new Response(
      JSON.stringify({ 
        success: true, 
        gym: gymData,
        user: userData.user,
        message: 'Gym registered successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

