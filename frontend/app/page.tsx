'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, ShieldCheck, BarChart3, Users, Rocket } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Document Upload',
      description: 'Upload contracts in PDF, DOCX, or TXT format',
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: 'AI Analysis',
      description: 'Get comprehensive contract analysis with risk detection',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Risk Scoring',
      description: 'Visualize contract risks with detailed scores',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Multi-User',
      description: 'Secure user isolation and team collaboration',
    },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

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
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                AI-Powered Contract Review for SMBs
              </h1>
              <p className="text-xl text-muted-foreground">
                Upload your contracts, get AI-powered analysis, and manage your legal documents efficiently.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="gap-2">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Free tier: 5 contracts/month • Paid tier: $249/month for 50 contracts
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
            <div className="relative bg-card p-8 rounded-3xl shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Upload Contract</h3>
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-muted rounded" />
                  <div className="h-2 w-3/4 bg-muted rounded" />
                  <div className="h-2 w-1/2 bg-muted rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-success/10 rounded-lg">
                    <div className="text-xs text-success-foreground">Risk Score: Low</div>
                  </div>
                  <div className="flex-1 p-3 bg-warning/10 rounded-lg">
                    <div className="text-xs text-warning-foreground">Risk Score: Medium</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need for professional contract management
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of businesses using Contract AI SaaS to streamline their contract review process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
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
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Contract AI SaaS</span>
              </div>
              <p className="text-muted-foreground">
                AI-Powered Contract Review for SMBs
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Contract AI SaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
