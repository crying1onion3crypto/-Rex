'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ShieldCheck, BarChart3, Upload, Plus, Folder, Tag, Settings, User, CreditCard } from 'lucide-react';
import { useContracts } from '@/hooks/use-contracts';
import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { contractsData, isLoadingContracts } = useContracts();
  const { dashboardData, isLoadingDashboard } = useDashboard();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || isLoadingDashboard || isLoadingContracts) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const stats = dashboardData?.data as DashboardStats;

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here's what's happening with your contracts.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContracts || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.completedContracts || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRiskScore || 0}%</div>
            <p className="text-xs text-muted-foreground">Average risk level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.processingContracts || 0}</div>
            <p className="text-xs text-muted-foreground">Contracts being analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.subscription.remainingContracts || 0}/{stats?.subscription.contractLimit || 0}
            </div>
            <p className="text-xs text-muted-foreground">Contracts remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/contracts/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Upload Contract</h3>
                <p className="text-sm text-muted-foreground">Upload a new contract for analysis</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/contracts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-secondary/10 rounded-full w-fit mx-auto mb-4">
                  <FileText className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">My Contracts</h3>
                <p className="text-sm text-muted-foreground">View all your contracts</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/folders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-success/10 rounded-full w-fit mx-auto mb-4">
                  <Folder className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Folders</h3>
                <p className="text-sm text-muted-foreground">Organize your contracts</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="p-4 bg-warning/10 rounded-full w-fit mx-auto mb-4">
                  <Settings className="h-8 w-8 text-warning" />
                </div>
                <h3 className="font-semibold mb-2">Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your account</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Contracts</h2>
          <Link href="/contracts">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        
        {contractsData?.contracts?.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contractsData.contracts.slice(0, 6).map((contract) => (
              <Card key={contract.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{contract.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{contract.fileName}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                    {contract.riskScore && (
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">{contract.riskScore}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No contracts yet</h3>
              <p className="text-muted-foreground mb-4">Upload your first contract to get started</p>
              <Link href="/contracts/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Contract
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    uploading: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    complete: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}
