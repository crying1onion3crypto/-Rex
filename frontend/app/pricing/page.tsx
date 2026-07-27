"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Rocket, ShieldCheck, BarChart3, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function PricingPage() {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      contractLimit: 5,
      features: [
        'Basic contract analysis',
        'Risk detection',
        'Clause extraction',
        'Limited storage (10 contracts)',
        'Email support',
      ],
      popular: false,
      badge: 'Free Forever',
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
        'Unlimited storage',
        'Priority email support',
        'Team collaboration (up to 5 users)',
        'API access',
        'Custom analysis templates',
      ],
      popular: true,
      badge: 'Most Popular',
    },
  ]

  const features = [
    {
      icon: <Rocket className="h-6 w-6" />,
      title: 'AI-Powered Analysis',
      description: 'Get comprehensive contract analysis with risk detection and clause extraction',
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: 'Risk Detection',
      description: 'Identify potential risks in your contracts before you sign',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Detailed Reports',
      description: 'Receive detailed analysis reports with actionable insights',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Work together with your team on contract reviews (Pro only)',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Contract AI SaaS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container py-24 md:py-32 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees. No surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container py-16">
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`border-2 ${
                plan.popular
                  ? 'border-primary shadow-2xl shadow-primary/20'
                  : 'border-transparent hover:border-primary/50'
              }`}
            >
              <CardHeader className="text-center">
                <div className="space-y-4">
                  {plan.popular && (
                    <Badge variant="default" className="gap-1">
                      <Crown className="h-4 w-4" />
                      {plan.badge}
                    </Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price, plan.currency)}
                    </div>
                    <CardDescription>
                      per {plan.interval}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="font-medium">
                    <span className="text-2xl">{plan.contractLimit}</span> contracts/month
                  </p>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  {plan.price === 0 ? (
                    <Link href="/auth/register" className="block">
                      <Button className="w-full">
                        Get Started Free
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/login" className="block">
                      <Button className="w-full">
                        Start Free Trial
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Everything You Need</h2>
          <p className="text-xl text-muted-foreground">
            All plans include our powerful AI analysis features
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-xl w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16">
        <Card className="bg-muted/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription>
              Have questions? We have answers.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold">What happens when I reach my contract limit?</h3>
              <p className="text-muted-foreground">
                You won't be able to upload new contracts until the next billing period or until you upgrade your plan. Existing contracts remain accessible.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel at any time from your billing portal. Your access will continue until the end of your current billing period.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Do you offer annual billing?</h3>
              <p className="text-muted-foreground">
                Currently, we only offer monthly billing. Annual plans with discounts may be available in the future.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes! Our Free plan is completely free forever with no credit card required. The Pro plan includes a 7-day free trial.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="py-12 text-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of businesses using Contract AI SaaS to streamline their contract review process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="gap-2">
                    Start Free Trial
                    <Rocket className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="gap-2">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Contract AI SaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
