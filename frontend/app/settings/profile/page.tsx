"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Building, Phone, ArrowLeft, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const { error: showError, success: showSuccess } = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setFormData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
        company: session.user.company || '',
        phone: session.user.phone || '',
      })
      setIsLoading(false)
    } else if (status === 'unauthenticated') {
      // Redirect to login
      window.location.href = '/auth/login'
    }
  }, [status, session])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // In a real app, you would call your API to update the profile
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      showSuccess('Profile Updated', 'Your profile has been updated successfully')
      
      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          ...formData,
        },
      })
    } catch (err: any) {
      showError('Update Failed', err.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
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
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
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
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      placeholder="Your Company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/settings/change-password">
                  Change Password
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" asChild>
                <Link href="/settings/delete-account">
                  Delete Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
