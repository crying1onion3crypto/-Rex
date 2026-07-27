import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

export async function POST(request: Request) {
  const { email, password, firstName, lastName, company, phone } = await request.json()

  // Validate required fields
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    )
  }

  // Validate password strength
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  try {
    // Hash password
    const hashedPassword = await hash(password, 12)

    // In a real app, you would:
    // 1. Check if user already exists in your database
    // 2. Create the user record
    // 3. Create a free subscription for the user
    // 4. Return success

    // For now, we'll simulate the process
    console.log('Registering user:', email)

    // Simulate API call to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        company,
        phone,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(
        { error: data.error || 'Registration failed' },
        { status: response.status }
      )
    }

    const user = await response.json()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      message: 'Registration successful',
    })
  } catch (err: any) {
    console.error('Registration error:', err.message)
    return NextResponse.json(
      { error: 'Registration failed', message: err.message },
      { status: 500 }
    )
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { message: 'Registration endpoint - POST only' },
    { status: 405 }
  )
}
