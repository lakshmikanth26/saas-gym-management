import { supabase } from './supabase'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

/**
 * Load Razorpay script
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Create Razorpay order via Supabase Edge Function
 */
export async function createRazorpayOrder({ amount, receipt, notes }) {
  try {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        amount,
        currency: 'INR',
        receipt,
        notes,
      },
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)

    return data.order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

/**
 * Open Razorpay payment modal
 */
export async function openRazorpayModal({
  amount,
  name,
  description,
  receipt,
  notes,
  prefill,
  onSuccess,
  onFailure,
}) {
  const scriptLoaded = await loadRazorpayScript()
  
  if (!scriptLoaded) {
    throw new Error('Failed to load Razorpay SDK')
  }

  // Create order
  const order = await createRazorpayOrder({ amount, receipt, notes })

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name,
    description,
    order_id: order.id,
    prefill: {
      name: prefill?.name || '',
      email: prefill?.email || '',
      contact: prefill?.phone || '',
    },
    theme: {
      color: '#4f46e5',
    },
    handler: function (response) {
      onSuccess({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      })
    },
    modal: {
      ondismiss: function () {
        onFailure && onFailure({ message: 'Payment cancelled by user' })
      },
    },
  }

  const razorpay = new window.Razorpay(options)
  razorpay.open()
}

/**
 * Verify payment and complete gym registration
 */
export async function verifyPaymentAndCreateGym({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  gym_data,
  plan_type,
}) {
  try {
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        gym_data,
        plan_type,
      },
    })

    if (error) throw error
    if (!data.success) throw new Error(data.error)

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
  const receipt = `member-${member_id}-${Date.now()}`
  
  await openRazorpayModal({
    amount,
    name: 'Membership Payment',
    description: 'Gym Membership Renewal',
    receipt,
    notes: {
      gym_id,
      member_id,
      membership_plan_id,
    },
    prefill: {
      name: member_name,
      email: member_email,
      phone: member_phone,
    },
    onSuccess: async (paymentData) => {
      // Save payment to database
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          gym_id,
          member_id,
          membership_plan_id,
          amount,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
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
    },
    onFailure,
  })
}

