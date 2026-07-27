"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, Check, X, Clock, Crown, ArrowLeft, ExternalLink } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'

export default function BillingPage() {
  const { error: showError } = useToast()
  const [subscription, setSubscription] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    // Fetch subscription data
    const fetchSubscription = async () => {
      try {
        setIsLoading(true)
        
        // In a real app, you would fetch from your API
        // For now, we'll use mock data
        const mockSubscription = {
          planId: 'free',
          planName: 'Free',
          contractsUsed: 2,
          contractLimit: 5,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isTrial: false,
        }
        
        setSubscription(mockSubscription)
        setPlans([
          {
            id: 'free',
            name: 'Free',
            price: 0,
            currency: 'USD',
            interval: 'month',
            contractLimit: 5,
            features: ['Basic contract analysis', 'Limited storage', 'Email support'],
            isActive: true,
          },
          {
            id: 'pro',
            name: 'Pro',
            price: 249,
            currency: 'USD',
            interval: 'month',
            contractLimit: 50,
            features: [
              'Advanced contract analysis',
              'Priority processing',
              'Full feature access',
              'Priority support',
              'Team collaboration',
            ],
            isActive: true,
          },
        ])
      } catch (err: any) {
        showError('Error', err.message || 'Failed to load subscription data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [showError])

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId)
    try {
      // In a real app, you would call your API to create a Stripe checkout session
      // For now, we'll simulate the process
      
      // This would typically redirect to Stripe checkout
      window.location.href = `/api/stripe/checkout?planId=${planId}`
    } catch (err: any) {
      showError('Error', err.message || 'Failed to initiate upgrade')
    }
  }

  const handleManageBilling = () => {
    // In a real app, this would redirect to Stripe customer portal
    window.location.href = '/api/stripe/portal'
  }

  const getUsagePercentage = () => {
    if (!subscription || !subscription.contractLimit) return 0
    return Math.min(100, (subscription.contractsUsed / subscription.contractLimit) * 100)
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/settings">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your plan and payment methods</p>
          </div>
        </div>

        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{subscription?.planName}</h3>
                <p className="text-muted-foreground">
                  {subscription?.planName === 'Free' ? 'No credit card required' : 'Monthly billing'}
                </p>
              </div>
              {subscription?.planName === 'Pro' && (
                <Badge variant="default" className="gap-1">
                  <Crown className="h-4 w-4" />
                  Pro
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contract Limit</span>
                <span className="font-medium">
                  {subscription?.contractLimit || 0} contracts/month
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contracts Used</span>
                <span className="font-medium">
                  {subscription?.contractsUsed || 0} / {subscription?.contractLimit || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${getUsagePercentage()}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(getUsagePercentage())}%
                </span>
              </div>
            </div>

            {subscription?.planName === 'Free' && (
              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade('pro')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            )}

            {subscription?.planName === 'Pro' && (
              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleManageBilling}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing Portal
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Manage payment methods, invoices, and subscription
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map(plan => (
              <Card
                key={plan.id}
                className={`border-2 ${
                  subscription?.planId === plan.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-primary/50'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      {plan.id === 'pro' && (
                        <Badge variant="default" className="mt-1 gap-1">
                          <Crown className="h-3 w-3" />
                          Most Popular
                        </Badge>
                      )}
                    </div>
                    <span className="text-3xl font-bold">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price, plan.currency)}
                    </span>
                  </div>
                  <CardDescription>
                    {plan.price === 0 ? 'No credit card required' : `Billed ${plan.interval}ly`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium">
                      <span className="text-2xl">{plan.contractLimit}</span> contracts/month
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {subscription?.planId === plan.id ? (
                    <Button className="w-full" disabled>
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment History */}
        {subscription?.planName === 'Pro' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your recent payments and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto mb-2" />
                <p>Payment history will appear here</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={handleManageBilling}
                >
                  View in Billing Portal <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">What happens when I reach my contract limit?</h4>
              <p className="text-sm text-muted-foreground">
                You won't be able to upload new contracts until the next billing period or until you upgrade your plan.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Can I cancel my subscription?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel at any time from your billing portal. Your access will continue until the end of your current billing period.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Do you offer annual billing?</h4>
              <p className="text-sm text-muted-foreground">
                Currently, we only offer monthly billing. Annual plans may be available in the future.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
