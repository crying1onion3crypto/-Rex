"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useContracts } from '@/hooks/use-contracts'
import { useToast } from '@/hooks/use-toast'
import { FileText, ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock, ArrowLeft, PlayCircle } from 'lucide-react'
import { formatDate, getRiskLevelColor, getRiskLevelBgColor } from '@/lib/utils'

export default function ContractAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const { getContractWithAnalysis, analyzeContract } = useContracts()
  const { error: showError } = useToast()
  const [contract, setContract] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const contractId = params.id as string
        const data = await getContractWithAnalysis(contractId)
        setContract(data.contract)
        setAnalysis(data.analysis)
      } catch (err: any) {
        showError('Error', err.message || 'Failed to load contract')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, getContractWithAnalysis, showError])

  const handleAnalyze = async () => {
    if (!contract) return

    setIsAnalyzing(true)
    try {
      await analyzeContract.mutateAsync(contract.id)
      // Refresh data
      const data = await getContractWithAnalysis(contract.id)
      setContract(data.contract)
      setAnalysis(data.analysis)
    } catch (err: any) {
      showError('Analysis Failed', err.message || 'Failed to start analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskLevelIcon = (level: string) => {
    const icons = {
      low: <CheckCircle className="h-5 w-5 text-green-600" />,
      medium: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      high: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      critical: <XCircle className="h-5 w-5 text-red-600" />,
    }
    return icons[level as keyof typeof icons] || <ShieldCheck className="h-5 w-5" />
  }

  const getRiskLevelText = (level: string) => {
    const texts = {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk',
      critical: 'Critical Risk',
    }
    return texts[level as keyof typeof texts] || 'Unknown'
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/contracts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Contract Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The contract you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/contracts">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Button>
          </Link>
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
            <Link href="/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{contract.title}</h1>
            <p className="text-muted-foreground">{contract.fileName}</p>
          </div>
        </div>

        {/* Contract Info */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <span className={`px-2 py-1 rounded-full text-xs ${
                contract.status === 'complete' ? 'bg-green-100 text-green-800' :
                contract.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                contract.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {contract.status}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(contract.createdAt)}</div>
              <p className="text-xs text-muted-foreground">Uploaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contract.riskScore ? `${contract.riskScore}%` : 'N/A'}
              </div>
              {contract.riskLevel && (
                <div className="flex items-center gap-2 mt-2">
                  {getRiskLevelIcon(contract.riskLevel)}
                  <span className={`text-sm ${getRiskLevelColor(contract.riskLevel)}`}>
                    {getRiskLevelText(contract.riskLevel)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">File Info</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contract.fileType.toUpperCase()}</div>
              <p className="text-xs text-muted-foreground">
                {(contract.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Section */}
        <div className="space-y-4">
          {!analysis && contract.status !== 'processing' && (
            <Card className="text-center">
              <CardContent className="py-8">
                <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Ready for Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  This contract hasn't been analyzed yet
                </p>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || contract.status === 'processing'}
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Starting Analysis...
                    </>
                  ) : (
                    'Analyze Contract'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {contract.status === 'processing' && !analysis && (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="font-semibold mb-2">Analyzing Contract</h3>
                <p className="text-muted-foreground mb-4">
                  Our AI is analyzing your contract. This may take a few minutes.
                </p>
                <Progress className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Processing your document...
                </p>
              </CardContent>
            </Card>
          )}

          {analysis && (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                <TabsTrigger value="clauses">Clauses</TabsTrigger>
                <TabsTrigger value="missing">Missing Clauses</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Summary</CardTitle>
                    <CardDescription>
                      AI-generated overview of your contract
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.summary?.overview && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Overview</h4>
                        <p className="text-muted-foreground">{analysis.summary.overview}</p>
                      </div>
                    )}
                    {analysis.summary?.keyPoints && analysis.summary.keyPoints.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Key Points</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {analysis.summary.keyPoints.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.summary?.partiesInvolved && analysis.summary.partiesInvolved.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Parties Involved</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.summary.partiesInvolved.map((party: string, index: number) => (
                            <Badge key={index} variant="secondary">{party}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(analysis.summary?.effectiveDate || analysis.summary?.terminationDate) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.summary.effectiveDate && (
                          <div className="space-y-1">
                            <h4 className="font-semibold">Effective Date</h4>
                            <p className="text-muted-foreground">{analysis.summary.effectiveDate}</p>
                          </div>
                        )}
                        {analysis.summary.terminationDate && (
                          <div className="space-y-1">
                            <h4 className="font-semibold">Termination Date</h4>
                            <p className="text-muted-foreground">{analysis.summary.terminationDate}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Risk Analysis Tab */}
              <TabsContent value="risk">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                    <CardDescription>
                      Identified risks and their severity levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.riskAnalysis?.riskFlags && analysis.riskAnalysis.riskFlags.length > 0 ? (
                      <div className="space-y-4">
                        {/* Risk Distribution */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {analysis.riskAnalysis.riskDistribution?.low || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Low Risk</div>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">
                              {analysis.riskAnalysis.riskDistribution?.medium || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Medium Risk</div>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {analysis.riskAnalysis.riskDistribution?.high || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">High Risk</div>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {analysis.riskAnalysis.riskDistribution?.critical || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Critical Risk</div>
                          </div>
                        </div>

                        {/* Risk Flags */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Risk Flags</h4>
                          {analysis.riskAnalysis.riskFlags.map((flag: any, index: number) => (
                            <Card key={index} className={getRiskLevelBgColor(flag.severity)}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={getRiskLevelColor(flag.severity)}>
                                    {getRiskLevelIcon(flag.severity)}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium">{flag.clause}</h5>
                                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                                    {flag.category && (
                                      <Badge variant="secondary" className="mt-2 text-xs">
                                        {flag.category}
                                      </Badge>
                                    )}
                                    {flag.recommendation && (
                                      <div className="mt-2 p-2 bg-background rounded text-sm">
                                        <strong>Recommendation:</strong> {flag.recommendation}
                                      </div>
                                    )}
                                    {flag.location && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Location: {flag.location}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No risk flags identified
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Clauses Tab */}
              <TabsContent value="clauses">
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Clauses</CardTitle>
                    <CardDescription>
                      Important clauses found in your contract
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.extractedClauses && analysis.extractedClauses.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.extractedClauses.map((clause: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {clause.type.replace('_', ' ')}
                              </Badge>
                              {clause.startPage && clause.endPage && (
                                <span className="text-sm text-muted-foreground">
                                  Pages {clause.startPage}-{clause.endPage}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold mb-2">Summary</h4>
                            <p className="text-muted-foreground mb-3">{clause.summary}</p>
                            <h4 className="font-semibold mb-2">Full Text</h4>
                            <div className="p-3 bg-muted/50 rounded text-sm">
                              <pre className="whitespace-pre-wrap">{clause.text}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No clauses extracted
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Missing Clauses Tab */}
              <TabsContent value="missing">
                <Card>
                  <CardHeader>
                    <CardTitle>Missing Clauses</CardTitle>
                    <CardDescription>
                      Important clauses that are typically present but missing from your contract
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.missingClauses && analysis.missingClauses.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.missingClauses.map((clause: any, index: number) => (
                          <Card key={index} className={getRiskLevelBgColor(clause.importance)}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={getRiskLevelColor(clause.importance)}>
                                  {getRiskLevelIcon(clause.importance)}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium">{clause.type.replace('_', ' ')}</h5>
                                  <p className="text-sm text-muted-foreground mt-1">{clause.description}</p>
                                  <div className="mt-2 p-2 bg-background rounded text-sm">
                                    <strong>Recommendation:</strong> {clause.recommendation}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold mb-2">All Important Clauses Present</h3>
                        <p className="text-muted-foreground">
                          No commonly missing clauses detected in your contract
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
