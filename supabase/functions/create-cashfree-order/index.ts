// Supabase Edge Function: Create Cashfree Order
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { order_amount, order_currency = 'INR', customer_details, order_meta } = await req.json()

    // Cashfree API credentials from environment
    const cashfreeAppId = Deno.env.get('CASHFREE_APP_ID')
    const cashfreeSecretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    const cashfreeApiUrl = Deno.env.get('CASHFREE_API_URL') || 'https://sandbox.cashfree.com/pg'

    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error('Cashfree credentials not configured')
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create Cashfree order
    const orderPayload = {
      order_id: orderId,
      order_amount: order_amount,
      order_currency: order_currency,
      customer_details: {
        customer_id: customer_details.customer_id,
        customer_name: customer_details.customer_name,
        customer_email: customer_details.customer_email,
        customer_phone: customer_details.customer_phone,
      },
      order_meta: order_meta || {},
    }

    const orderResponse = await fetch(`${cashfreeApiUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      throw new Error(`Cashfree API error: ${JSON.stringify(errorData)}`)
    }

    const order = await orderResponse.json()

    return new Response(
      JSON.stringify({ success: true, order }),
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

