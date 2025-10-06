// Supabase Edge Function: Send Notification Email
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
    const { 
      gym_id,
      member_id,
      user_id,
      type,
      title,
      message,
      send_email = true
    } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        gym_id,
        member_id,
        user_id,
        type,
        title,
        message,
        is_read: false,
      })
      .select()
      .single()

    if (notificationError) {
      throw new Error(`Failed to create notification: ${notificationError.message}`)
    }

    // Send email if enabled
    if (send_email) {
      const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
      
      if (sendgridApiKey) {
        // Fetch member or user email
        let recipientEmail = ''
        let recipientName = ''
        let gymName = ''

        if (member_id) {
          const { data: member } = await supabase
            .from('members')
            .select('email, full_name, gym:gyms(name)')
            .eq('id', member_id)
            .single()
          
          if (member) {
            recipientEmail = member.email
            recipientName = member.full_name
            gymName = member.gym?.name || ''
          }
        } else if (user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(user_id)
          if (userData.user) {
            recipientEmail = userData.user.email || ''
            recipientName = userData.user.user_metadata?.full_name || ''
          }

          const { data: gym } = await supabase
            .from('gyms')
            .select('name')
            .eq('id', gym_id)
            .single()
          
          if (gym) {
            gymName = gym.name
          }
        }

        if (recipientEmail) {
          try {
            const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${sendgridApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                personalizations: [{
                  to: [{ 
                    email: recipientEmail,
                    name: recipientName 
                  }],
                  subject: title,
                }],
                from: { 
                  email: 'noreply@gymmanagement.com',
                  name: gymName || 'Gym Management'
                },
                content: [{
                  type: 'text/html',
                  value: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
                        .content { padding: 30px; background-color: #f9fafb; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>${gymName || 'Gym Management'}</h1>
                        </div>
                        <div class="content">
                          <h2>${title}</h2>
                          <p>${message}</p>
                        </div>
                        <div class="footer">
                          <p>This is an automated notification from ${gymName || 'your gym'}.</p>
                        </div>
                      </div>
                    </body>
                    </html>
                  `,
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
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification,
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

