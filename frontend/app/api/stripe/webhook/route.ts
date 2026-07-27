import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature') || ''
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
  })

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        // Handle successful checkout
        console.log('Checkout session completed:', session.id)
        
        // Here you would typically:
        // 1. Update user's subscription in your database
        // 2. Send confirmation email
        // 3. Grant access to premium features
        
        break
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        // Handle successful payment
        console.log('Invoice payment succeeded:', invoice.id)
        
        // Here you would typically:
        // 1. Update payment status in your database
        // 2. Reset contract count for the new period
        // 3. Send payment receipt
        
        break
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        // Handle failed payment
        console.log('Invoice payment failed:', failedInvoice.id)
        
        // Here you would typically:
        // 1. Update subscription status to past_due
        // 2. Send payment failure notification
        // 3. Restrict access if needed
        
        break
      
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        // Handle subscription update
        console.log('Subscription updated:', subscription.id)
        
        // Here you would typically:
        // 1. Update subscription details in your database
        // 2. Handle plan changes
        
        break
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        // Handle subscription cancellation
        console.log('Subscription deleted:', deletedSubscription.id)
        
        // Here you would typically:
        // 1. Update subscription status to canceled
        // 2. Send cancellation confirmation
        
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json(
      { error: 'Webhook Error', message: err.message },
      { status: 400 }
    )
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { message: 'Webhook endpoint - POST only' },
    { status: 405 }
  )
}
