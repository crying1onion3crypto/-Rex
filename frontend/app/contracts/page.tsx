"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useContracts } from '@/hooks/use-contracts'
import { useToast } from '@/hooks/use-toast'
import { FileText, Upload, Search, Filter, Plus, MoreVertical, Eye, Trash2, Folder, Tag } from 'lucide-react'
import { formatDate, getStatusColor, getRiskLevelColor } from '@/lib/utils'

export default function ContractsPage() {
  const { contractsData, isLoadingContracts, refetchContracts } = useContracts()
  const { error: showError } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [folderFilter, setFolderFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    refetchContracts()
  }, [refetchContracts])

  const filteredContracts = contractsData?.contracts?.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    const matchesFolder = folderFilter === 'all' || contract.folderId === folderFilter
    return matchesSearch && matchesStatus && matchesFolder
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      uploading: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      complete: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getRiskLevelBadge = (level: string | null) => {
    if (!level) return null
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (isLoadingContracts) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">My Contracts</h1>
            <p className="text-muted-foreground">
              Manage and analyze your contracts
            </p>
          </div>
          <Link href="/contracts/upload">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Contract
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="uploading">Uploading</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  <SelectItem value="">No Folder</SelectItem>
                  {/* In real app, fetch folders from API */}
                  <SelectItem value="inbox">Inbox</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <div className="space-y-4">
          {filteredContracts && filteredContracts.length > 0 ? (
            filteredContracts.map(contract => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-muted rounded-lg">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{contract.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{contract.fileName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {contract.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(contract.status)}`}>
                          {contract.status}
                        </span>
                        {contract.riskScore && (
                          <span className={`px-2 py-1 rounded-full text-xs ${getRiskLevelBadge(contract.riskLevel || '')}`}>
                            Risk: {contract.riskScore}%
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(contract.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/contracts/${contract.id}/analysis`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No contracts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' || folderFilter !== 'all'
                    ? 'No contracts match your filters'
                    : 'Upload your first contract to get started'}
                </p>
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

        {/* Pagination */}
        {filteredContracts && filteredContracts.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredContracts.length} of {contractsData?.total || 0} contracts
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filteredContracts.length < 20}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
