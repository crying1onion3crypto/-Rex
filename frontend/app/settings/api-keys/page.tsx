"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Key, Plus, Trash2, Copy, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'

export default function ApiKeysPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    provider: 'deepseek',
  })

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true)
      
      // In a real app, you would fetch from your API
      // For now, we'll use mock data
      const mockApiKeys = [
        {
          id: '1',
          name: 'DeepSeek Main',
          provider: 'deepseek',
          key: 'sk-abc123...',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'OpenAI Backup',
          provider: 'openai',
          key: 'sk-def456...',
          isActive: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]
      
      setApiKeys(mockApiKeys)
    } catch (err: any) {
      showError('Error', err.message || 'Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // In a real app, you would call your API to create an API key
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKeyData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create API key')
      }

      const newKey = await response.json()
      showSuccess('API Key Created', 'Your new API key has been created successfully')
      
      // Refresh the list
      fetchApiKeys()
      
      // Reset form
      setNewKeyData({ name: '', provider: 'deepseek' })
    } catch (err: any) {
      showError('Error', err.message || 'Failed to create API key')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      // In a real app, you would call your API to delete the API key
      const response = await fetch(`/api/settings/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete API key')
      }

      showSuccess('API Key Deleted', 'The API key has been deleted successfully')
      fetchApiKeys()
    } catch (err: any) {
      showError('Error', err.message || 'Failed to delete API key')
    }
  }

  const handleToggleApiKey = async (keyId: string, currentStatus: boolean) => {
    try {
      // In a real app, you would call your API to toggle the API key status
      const response = await fetch(`/api/settings/api-keys/${keyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update API key')
      }

      showSuccess('API Key Updated', 'The API key status has been updated')
      fetchApiKeys()
    } catch (err: any) {
      showError('Error', err.message || 'Failed to update API key')
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    showSuccess('Key Copied', 'API key copied to clipboard')
  }

  const getProviderColor = (provider: string) => {
    const colors = {
      deepseek: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      openai: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    }
    return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
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
            <h1 className="text-2xl font-bold">API Keys</h1>
            <p className="text-muted-foreground">
              Manage your API keys for AI providers
            </p>
          </div>
        </div>

        {/* Create New API Key */}
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key for AI provider integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateApiKey} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="My DeepSeek Key"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={newKeyData.provider}
                    onValueChange={(value) => setNewKeyData(prev => ({ ...prev, provider: value }))}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create API Key
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length > 0 ? (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{key.name}</h3>
                          <Badge className={getProviderColor(key.provider)}>
                            {key.provider.toUpperCase()}
                          </Badge>
                          <Badge variant={key.isActive ? 'default' : 'secondary'}>
                            {key.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created: {new Date(key.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(key.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleApiKey(key.id, key.isActive)}
                        >
                          {key.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteApiKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-8 w-8 mx-auto mb-2" />
                <p>No API keys configured</p>
                <p className="text-sm mt-1">
                  Create your first API key to start using AI analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">DeepSeek</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://deepseek.com" className="text-primary hover:underline">DeepSeek</a></li>
                <li>Sign up for an account</li>
                <li>Get your API key from the dashboard</li>
                <li>Add it here with provider set to "DeepSeek"</li>
              </ol>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">OpenAI</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://platform.openai.com" className="text-primary hover:underline">OpenAI Platform</a></li>
                <li>Sign up for an account</li>
                <li>Get your API key from the API keys section</li>
                <li>Add it here with provider set to "OpenAI"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
