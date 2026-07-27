"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Rocket, FileText, ShieldCheck, BarChart3, Users, Settings, Home, LogIn, UserPlus } from 'lucide-react'

export function MainNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { href: '/dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { href: '/contracts', label: 'Contracts', icon: <FileText className="h-4 w-4" /> },
    { href: '/analysis', label: 'Analysis', icon: <ShieldCheck className="h-4 w-4" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ]

  const authItems = [
    { href: '/auth/login', label: 'Login', icon: <LogIn className="h-4 w-4" /> },
    { href: '/auth/register', label: 'Sign Up', icon: <UserPlus className="h-4 w-4" /> },
  ]

  const isAuthPage = pathname?.startsWith('/auth')
  const isPublicPage = pathname === '/' || pathname === '/pricing' || pathname?.startsWith('/auth')

  if (isAuthPage) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Contract AI SaaS</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isPublicPage && (
            <div className="flex gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  asChild
                  className="gap-2"
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          )}

          {isPublicPage ? (
            <div className="flex gap-2">
              {authItems.map((item) => (
                <Button key={item.href} variant="ghost" asChild className="gap-2">
                  <Link href={item.href}>
                    {item.icon}
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="gap-2">
                <Link href="/settings/profile">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden md:inline">Account</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
