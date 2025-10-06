// Supabase Edge Function: Get Cashfree Payment Status
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { order_id } = await req.json()

    const cashfreeAppId = Deno.env.get('CASHFREE_APP_ID')
    const cashfreeSecretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    const cashfreeApiUrl = Deno.env.get('CASHFREE_API_URL') || 'https://sandbox.cashfree.com/pg'

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Cashfree credentials not configured')
    }

    // Get order details
    const orderResponse = await fetch(`${cashfreeApiUrl}/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
      },
    })

    if (!orderResponse.ok) {
      throw new Error('Failed to fetch order status')
    }

    const orderData = await orderResponse.json()

    // Get payments for the order
    const paymentsResponse = await fetch(`${cashfreeApiUrl}/orders/${order_id}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
      },
    })

    let paymentData = null
    if (paymentsResponse.ok) {
      const payments = await paymentsResponse.json()
      // Get the first (and usually only) payment
      paymentData = Array.isArray(payments) && payments.length > 0 ? payments[0] : payments
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: orderData,
        payment: paymentData,
        payments: paymentData ? [paymentData] : [] // Keep for backwards compatibility
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

