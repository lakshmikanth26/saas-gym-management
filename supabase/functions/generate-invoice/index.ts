// Supabase Edge Function: Generate Invoice and Send Email
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
    const { payment_id } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Fetch payment details with member and gym info
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        member:members(
          id,
          full_name,
          email,
          phone
        ),
        gym:gyms(
          id,
          name,
          email,
          phone,
          address
        ),
        membership_plan:membership_plans(
          name,
          duration_days
        )
      `)
      .eq('id', payment_id)
      .single()

    if (paymentError || !payment) {
      throw new Error('Payment not found')
    }

    // Generate invoice number
    const invoiceNumber = `INV-${payment.gym.id.substring(0, 8)}-${Date.now()}`

    // Calculate tax and total
    const amount = parseFloat(payment.amount)
    const tax = amount * 0.18 // 18% GST
    const total = amount + tax

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        gym_id: payment.gym_id,
        member_id: payment.member_id,
        payment_id: payment.id,
        invoice_number: invoiceNumber,
        amount,
        tax,
        total,
        status: 'paid',
      })
      .select()
      .single()

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`)
    }

    // Generate HTML invoice
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .gym-info, .member-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Invoice Number: ${invoiceNumber}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="gym-info">
          <h3>From:</h3>
          <p><strong>${payment.gym.name}</strong></p>
          <p>${payment.gym.address || ''}</p>
          <p>Email: ${payment.gym.email}</p>
          <p>Phone: ${payment.gym.phone}</p>
        </div>
        
        <div class="member-info">
          <h3>To:</h3>
          <p><strong>${payment.member.full_name}</strong></p>
          <p>Email: ${payment.member.email}</p>
          <p>Phone: ${payment.member.phone}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Duration</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${payment.membership_plan?.name || 'Membership'}</td>
              <td>${payment.membership_plan?.duration_days || 'N/A'} days</td>
              <td>₹${amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right;">Tax (18% GST):</td>
              <td>₹${tax.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td colspan="2" style="text-align: right;">Total:</td>
              <td>₹${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: center; color: #666;">
          <p>Thank you for your business!</p>
          <p>Payment ID: ${payment.razorpay_payment_id}</p>
        </div>
      </body>
      </html>
    `

    // Send email using SendGrid (optional - requires SendGrid API key)
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    
    if (sendgridApiKey) {
      try {
        const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: payment.member.email }],
              subject: `Invoice ${invoiceNumber} from ${payment.gym.name}`,
            }],
            from: { 
              email: payment.gym.email,
              name: payment.gym.name 
            },
            content: [{
              type: 'text/html',
              value: invoiceHtml,
            }],
          }),
        })

        if (!emailResponse.ok) {
          console.error('Failed to send email:', await emailResponse.text())
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice,
        invoice_html: invoiceHtml,
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

