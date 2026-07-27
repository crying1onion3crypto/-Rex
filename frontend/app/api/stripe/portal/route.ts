import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing required parameter: userId' },
      { status: 400 }
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
  })

  try {
    // In a real app, you would:
    // 1. Look up the user in your database
    // 2. Get their Stripe customer ID
    // 3. Create a portal session for that customer
    
    // For now, we'll create a mock customer ID
    const customerId = `cus_${userId}`

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      configuration: {
        business_profile: {
          name: 'Contract AI SaaS',
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Billing portal error:', err.message)
    return NextResponse.json(
      { error: 'Failed to create billing portal session', message: err.message },
      { status: 500 }
    )
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { message: 'Billing portal endpoint - POST only' },
    { status: 405 }
  )
}
