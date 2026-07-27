"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useContracts } from '@/hooks/use-contracts'
import { FileText, Upload, X, Loader2, Folder, Tag } from 'lucide-react'
import { MAX_FILE_SIZE, ALLOWED_FILE_EXTENSIONS } from '@/lib/constants'

export default function ContractUploadPage() {
  const router = useRouter()
  const { uploadContract } = useContracts()
  const { success: showSuccess, error: showError } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [folderId, setFolderId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check file types and size
    const validFiles = acceptedFiles.filter(file => {
      const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      return ALLOWED_FILE_EXTENSIONS.includes(extension) && file.size <= MAX_FILE_SIZE
    })

    if (validFiles.length === 0) {
      showError('Invalid Files', 'Only PDF, DOCX, TXT, and DOC files are allowed (max 50MB)')
      return
    }

    setFiles(prev => [...prev, ...validFiles])
  }, [showError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags(prev => [...prev, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      showError('No File', 'Please select a file to upload')
      return
    }

    if (!title.trim()) {
      showError('No Title', 'Please enter a title for the contract')
      return
    }

    setIsUploading(true)

    try {
      await uploadContract.mutateAsync({
        file: files[0],
        title: title.trim(),
        description: description.trim(),
        folderId: folderId || undefined,
      })

      showSuccess('Contract Uploaded', 'Your contract has been uploaded successfully!')
      router.push('/contracts')
    } catch (err: any) {
      showError('Upload Failed', err.message || 'Failed to upload contract')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Upload Contract</h1>
          <p className="text-muted-foreground">
            Upload your contract documents for AI-powered analysis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
            <CardDescription>
              Provide information about your contract
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Contract File</Label>
                  <CardDescription>
                    Supported formats: PDF, DOCX, TXT, DOC (Max 50MB)
                  </CardDescription>
                </div>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">
                    {isDragActive ? 'Drop the file here' : 'Drag & Drop or Click to Upload'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOCX, TXT, DOC files only (Max 50MB)
                  </p>
                </div>

                {/* File Preview */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected File:</h4>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{files[0].name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(files[0].size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(0)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Service Agreement with Acme Corp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the contract..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Folder */}
              <div className="space-y-2">
                <Label htmlFor="folder">Folder (Optional)</Label>
                <Select value={folderId} onValueChange={setFolderId}>
                  <SelectTrigger id="folder">
                    <SelectValue placeholder="Select a folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No folder</SelectItem>
                    {/* In a real app, you would fetch folders from API */}
                    <SelectItem value="inbox">Inbox</SelectItem>
                    <SelectItem value="active">Active Contracts</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          className="hover:text-destructive"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUploading || files.length === 0}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Contract'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>What You Get</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic risk detection, clause extraction, and summaries
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Upload className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Easy Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to upload your contracts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Folder className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">Organized</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep your contracts organized with folders and tags
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
