import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const { planId, userId } = await request.json()

  if (!planId || !userId) {
    return NextResponse.json(
      { error: 'Missing required parameters: planId and userId' },
      { status: 400 }
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
  })

  try {
    // Define plan prices (in a real app, these would come from your database)
    const planPrices: Record<string, { priceId: string; price: number }> = {
      free: { priceId: '', price: 0 },
      pro: {
        priceId: process.env.STRIPE_PRO_PLAN_PRICE_ID || '',
        price: 24900, // $249.00 in cents
      },
    }

    const plan = planPrices[planId]
    
    if (!plan || !plan.priceId) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      customer_email: userId, // In a real app, you would get the user's email
      metadata: {
        userId,
        planId,
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err.message)
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: err.message },
      { status: 500 }
    )
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { message: 'Checkout endpoint - POST only' },
    { status: 405 }
  )
}
