"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, CreditCard, Key, Settings, ShieldCheck, Bell, ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const settingsItems = [
    {
      title: 'Profile',
      description: 'Manage your personal information',
      href: '/settings/profile',
      icon: <User className="h-6 w-6" />,
    },
    {
      title: 'Billing',
      description: 'Manage your subscription and payment methods',
      href: '/settings/billing',
      icon: <CreditCard className="h-6 w-6" />,
    },
    {
      title: 'API Keys',
      description: 'Manage your API keys for AI providers',
      href: '/settings/api-keys',
      icon: <Key className="h-6 w-6" />,
    },
    {
      title: 'Security',
      description: 'Manage your account security settings',
      href: '/settings/security',
      icon: <ShieldCheck className="h-6 w-6" />,
    },
    {
      title: 'Notifications',
      description: 'Configure your notification preferences',
      href: '/settings/notifications',
      icon: <Bell className="h-6 w-6" />,
    },
    {
      title: 'Preferences',
      description: 'Customize your application preferences',
      href: '/settings/preferences',
      icon: <Settings className="h-6 w-6" />,
    },
  ]

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and configuration
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingsItems.map((item, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href={item.href} className="block">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      {item.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-1">{item.description}</CardDescription>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
