import { supabase } from './supabase'

const CASHFREE_APP_ID = import.meta.env.VITE_CASHFREE_APP_ID
const CASHFREE_ENV = import.meta.env.VITE_CASHFREE_ENV || 'sandbox' // 'sandbox' or 'production'

/**
 * Initialize Cashfree SDK
 */
export function initializeCashfree() {
  if (typeof window === 'undefined' || !window.Cashfree) {
    console.error('Cashfree SDK not loaded')
    return null
  }
  
  const cashfree = window.Cashfree({
    mode: CASHFREE_ENV // 'sandbox' or 'production'
  })
  
  return cashfree
}

/**
 * Create Cashfree order via Supabase Edge Function
 */
export async function createCashfreeOrder({ amount, customerDetails, notes }) {
  try {
    const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
      body: {
        order_amount: amount,
        order_currency: 'INR',
        customer_details: customerDetails,
        order_meta: {
          ...notes,
          return_url: `${window.location.origin}/payment/callback`,
        },
      },
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)

    return data.order
  } catch (error) {
    console.error('Error creating Cashfree order:', error)
    throw error
  }
}

/**
 * Open Cashfree payment modal
 */
export async function openCashfreeModal({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  notes,
  onSuccess,
  onFailure,
}) {
  try {
    // Initialize Cashfree
    const cashfree = initializeCashfree()
    if (!cashfree) {
      throw new Error('Failed to initialize Cashfree SDK')
    }

    // Create order
    const order = await createCashfreeOrder({
      amount,
      customerDetails: {
        customer_id: `CUST_${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      notes,
    })

    // Configure checkout options for MODAL/POPUP mode (stays on same page)
    const checkoutOptions = {
      paymentSessionId: order.payment_session_id,
      redirectTarget: '_modal', // Use modal instead of redirect
    }

    // Open checkout in modal/popup
    cashfree.checkout(checkoutOptions).then(async (result) => {
      console.log('Cashfree checkout result:', result)
      
      if (result.error) {
        // Payment failed
        console.error('Payment error:', result.error)
        onFailure && onFailure({
          error: result.error,
          order_id: order.order_id,
        })
      } else if (result.paymentDetails || result.paymentMessage) {
        // Payment successful - but we need to fetch payment details from Cashfree
        // because the modal doesn't return the payment_id directly
        
        try {
          // Get payment status from our Edge Function
          const { data: statusData, error: statusError } = await supabase.functions.invoke('get-cashfree-payment-status', {
            body: { order_id: order.order_id }
          })
          
          if (statusError || !statusData.success) {
            throw new Error('Failed to get payment status')
          }
          
          console.log('Payment status:', statusData)
          
          // Now call onSuccess with the full payment details
          onSuccess && onSuccess({
            order_id: order.order_id,
            payment_id: statusData.payment.cf_payment_id,
            payment_status: statusData.payment.payment_status,
            payment_amount: statusData.payment.payment_amount,
          })
        } catch (error) {
          console.error('Error fetching payment status:', error)
          onFailure && onFailure({
            error: error.message || 'Failed to verify payment',
            order_id: order.order_id,
          })
        }
      }
    }).catch((error) => {
      console.error('Checkout error:', error)
      onFailure && onFailure({
        error: error.message || 'Payment failed',
        order_id: order.order_id,
      })
    })
  } catch (error) {
    console.error('Error in payment flow:', error)
    onFailure && onFailure({ error: error.message })
  }
}

/**
 * Verify payment and complete gym registration
 */
export async function verifyPaymentAndCreateGym({
  order_id,
  payment_id,
  gym_data,
  plan_type,
}) {
  try {
    console.log('Verifying payment with:', { order_id, payment_id, gym_data, plan_type })
    
    const { data, error } = await supabase.functions.invoke('verify-cashfree-payment', {
      body: {
        order_id,
        payment_id,
        gym_data,
        plan_type,
      },
    })

    console.log('Verification response:', { data, error })

    if (error) {
      console.error('Supabase function error:', error)
      // Try to get the response body for more details
      if (error.context) {
        console.error('Error context:', error.context)
      }
      throw new Error(error.message || 'Failed to invoke verification function')
    }
    
    if (!data) {
      throw new Error('No response from verification function')
    }
    
    if (!data.success) {
      console.error('Verification failed with error:', data.error)
      console.error('Error details:', data.details)
      throw new Error(data.error || 'Verification failed')
    }

    return data
  } catch (error) {
    console.error('Error verifying payment:', error)
    throw error
  }
}

/**
 * Process member payment
 */
export async function processMemberPayment({
  gym_id,
  member_id,
  membership_plan_id,
  amount,
  member_name,
  member_email,
  member_phone,
  onSuccess,
  onFailure,
}) {
  await openCashfreeModal({
    amount,
    customerName: member_name,
    customerEmail: member_email,
    customerPhone: member_phone,
    notes: {
      gym_id,
      member_id,
      membership_plan_id,
    },
    onSuccess: async (paymentData) => {
      try {
        // Save payment to database
        const { data: payment, error } = await supabase
          .from('payments')
          .insert({
            gym_id,
            member_id,
            membership_plan_id,
            amount,
            payment_method: 'cashfree',
            cashfree_payment_id: paymentData.payment_id,
            cashfree_order_id: paymentData.order_id,
            payment_status: 'completed',
          })
          .select()
          .single()

        if (error) {
          console.error('Error saving payment:', error)
          onFailure && onFailure(error)
          return
        }

        // Generate invoice
        try {
          await supabase.functions.invoke('generate-invoice', {
            body: { payment_id: payment.id },
          })
        } catch (invoiceError) {
          console.error('Error generating invoice:', invoiceError)
        }

        onSuccess && onSuccess(payment)
      } catch (error) {
        console.error('Error in payment callback:', error)
        onFailure && onFailure(error)
      }
    },
    onFailure,
  })
}

/**
 * Get payment status
 */
export async function getPaymentStatus(order_id) {
  try {
    const { data, error } = await supabase.functions.invoke('get-cashfree-payment-status', {
      body: { order_id },
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting payment status:', error)
    throw error
  }
}

