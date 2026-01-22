'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Wand2,
  Database,
  Upload,
  Trash2,
  FileText,
  Loader2,
  Copy,
  Check,
  Globe,
  Settings,
  Palette,
  Image as ImageIcon,
  MessageSquare,
  Save,
  Send,
  X,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import dynamic from 'next/dynamic'
import { Node, Edge } from 'reactflow'

const FlowBuilder = dynamic(
  () => import('@/components/flow-builder/FlowBuilder'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#030617]" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    )
  }
)

interface Bot {
  id: string
  name: string
  description: string | null
  system_prompt: string
  api_key: string
  is_active: boolean
  flow_data: { nodes: Node[]; edges: Edge[] } | null
  appearance: BotAppearance | null
}

interface BotAppearance {
  primary_color: string
  secondary_color: string
  header_color: string
  background_color: string
  user_bubble_color: string
  bot_bubble_color: string
  user_text_color: string
  bot_text_color: string
  avatar_type: 'default' | 'image' | 'initials'
  avatar_url: string | null
  avatar_initials: string | null
  widget_icon_url: string | null
  loading_animation_url: string | null
  loading_position: 'avatar' | 'bubble' | 'both'
  chat_title: string
  chat_subtitle: string | null
  loading_style: 'dots' | 'spinner' | 'pulse' | 'skeleton' | 'custom'
  button_style: 'round' | 'square' | 'pill'
  position: 'bottom-right' | 'bottom-left'
}

const defaultAppearance: BotAppearance = {
  primary_color: '#00E5FF',
  secondary_color: '#00B8CC',
  header_color: '#0a0f1a',
  background_color: '#030617',
  user_bubble_color: '#00E5FF',
  bot_bubble_color: '#0a0f1a',
  user_text_color: '#030617',
  bot_text_color: '#ffffff',
  avatar_type: 'default',
  avatar_url: null,
  avatar_initials: null,
  widget_icon_url: null,
  loading_animation_url: null,
  loading_position: 'both',
  chat_title: 'Chat Assistant',
  chat_subtitle: null,
  loading_style: 'skeleton',
  button_style: 'round',
  position: 'bottom-right',
}

interface Document {
  id: string
  filename: string
  file_type: string
  file_size: number
  chunk_count: number
  created_at: string
}

interface StorageStats {
  bot_id: string
  document_count: number
  website_count: number
  chunk_count: number
  storage: {
    text_mb: number
    vector_mb: number
    total_mb: number
    total_gb: number
  }
  limits: {
    max_documents: number
    max_websites: number
    max_storage_mb: number
    max_chunks: number
  }
  usage: {
    documents_used: number
    documents_remaining: number
    websites_used: number
    websites_remaining: number
    chunks_used: number
    chunks_remaining: number
    storage_percentage: number
  }
}

interface ScrapeProgress {
  stage: string
  message: string
  current?: number
  total?: number
  percent?: number
  content_size_kb?: number
  total_chunks?: number
  chunks_stored?: number
  // Crawl-specific fields
  urls_found?: number
  urls_crawled?: number
  urls_total?: number
  current_url?: string
  crawl_stats?: {
    pages_discovered?: number
    pages_crawled?: number
    pages_with_content?: number
    urls_crawled?: string[]
  }
}

interface DocumentContent {
  document: {
    id: string
    filename: string
    file_path: string
    file_type: string
    file_size: number
    chunk_count: number
    created_at: string
  }
  chunks: {
    id: string
    content: string
    chunk_index: number
    char_count: number
  }[]
  full_content: string
  total_characters: number
}

type CrawlMode = 'single' | 'full-site'

export default function BotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [bot, setBot] = useState<Bot | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [scrapeProgress, setScrapeProgress] = useState<ScrapeProgress | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [activeTab, setActiveTab] = useState('builder')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [crawlMode, setCrawlMode] = useState<CrawlMode>('full-site')
  const [maxPages, setMaxPages] = useState(10)
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null)
  const [loadingStorage, setLoadingStorage] = useState(false)
  const [appearance, setAppearance] = useState<BotAppearance>(defaultAppearance)
  const [isSavingAppearance, setIsSavingAppearance] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null)
  const [viewingDocument, setViewingDocument] = useState<DocumentContent | null>(null)
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const [viewMode, setViewMode] = useState<'full' | 'chunks'>('full')

  const botId = params.id as string

  // Upload image to Supabase Storage
  const handleImageUpload = async (file: File, type: 'avatar' | 'widget_icon' | 'loading_animation') => {
    if (!bot) return

    setIsUploadingImage(type)
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${botId}/${type}_${Date.now()}.${fileExt}`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('bot-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bot-assets')
        .getPublicUrl(fileName)

      // Update appearance based on type
      if (type === 'avatar') {
        setAppearance({ ...appearance, avatar_url: publicUrl, avatar_type: 'image' })
      } else if (type === 'widget_icon') {
        setAppearance({ ...appearance, widget_icon_url: publicUrl })
      } else if (type === 'loading_animation') {
        setAppearance({ ...appearance, loading_animation_url: publicUrl })
      }

      toast({
        title: 'Success',
        description: 'Image uploaded successfully!',
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingImage(null)
    }
  }

  useEffect(() => {
    fetchBot()
    fetchDocuments()
    fetchStorageStats()
  }, [botId])

  const fetchStorageStats = async () => {
    try {
      setLoadingStorage(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/bot/${botId}/storage`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStorageStats(data)
      }
    } catch (error) {
      console.error('Error fetching storage stats:', error)
    } finally {
      setLoadingStorage(false)
    }
  }

  const fetchBot = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single()

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bot',
        variant: 'destructive',
      })
      router.push('/dashboard/bots')
      return
    }

    setBot(data as unknown as Bot)
    // Load appearance or use defaults
    if ((data as any).appearance) {
      setAppearance({ ...defaultAppearance, ...(data as any).appearance })
    }
    setIsLoading(false)
  }

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false })

    if (data) {
      setDocuments(data as unknown as Document[])
    }
  }

  const handleSaveFlow = async (nodes: Node[], edges: Edge[]) => {
    try {
      console.log('=== SAVING FLOW TO DATABASE ===')
      console.log('Bot ID:', botId)
      console.log('Nodes:', nodes.length)
      console.log('Edges:', edges.length)
      console.log('Flow data being saved:', { nodes, edges })
      
      const { data, error } = await supabase
        .from('bots')
        // @ts-ignore - Supabase type inference issue with JSONB
        .update({
          flow_data: JSON.parse(JSON.stringify({ nodes, edges })),
        })
        .eq('id', botId)
        .select()

      console.log('Save result:', { data, error })

      if (error) {
        console.error('Save error:', error)
        toast({
          title: 'Error',
          description: 'Failed to save flow',
          variant: 'destructive',
        })
        return
      }

      console.log('✅ Flow saved successfully!')
      console.log('Saved flow_data:', (data as any)?.[0]?.flow_data)

      toast({
        title: 'Success',
        description: 'Flow saved successfully!',
      })
      
      // Refresh bot data to confirm
      fetchBot()
    } catch (error) {
      console.error('Save exception:', error)
      toast({
        title: 'Error',
        description: 'Failed to save flow',
        variant: 'destructive',
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload files',
        variant: 'destructive',
      })
      setIsUploading(false)
      return
    }

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bot_id', botId)

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bot/${botId}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Upload failed')
        }

        const data = await response.json()
        const chunkInfo = data.chunk_details
        
        toast({
          title: '✅ Document Uploaded',
          description: chunkInfo 
            ? `${file.name}: ${chunkInfo.total_chunks} chunks created (${chunkInfo.file_size_kb} KB → ${chunkInfo.estimated_total_storage_kb} KB). ${chunkInfo.chunks_remaining} chunks remaining.`
            : `${file.name} uploaded successfully`,
        })
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || `Failed to upload ${file.name}`,
          variant: 'destructive',
        })
      }
    }

    setIsUploading(false)
    fetchDocuments()
    fetchStorageStats() // Refresh storage stats
    event.target.value = ''
  }

  const handleDeleteDocument = async (docId: string, filename: string) => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Success',
      description: `${filename} deleted`,
    })

    fetchDocuments()
    fetchStorageStats() // Refresh storage stats
  }

  const handleViewDocument = async (docId: string) => {
    setIsLoadingDocument(true)
    setViewingDocument(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bot/${botId}/document/${docId}/content`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load document content')
      }

      const data = await response.json()
      setViewingDocument(data as DocumentContent)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load document',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingDocument(false)
    }
  }

  const handleScrapeWebsite = async () => {
    if (!websiteUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a website URL',
        variant: 'destructive',
      })
      return
    }

    setIsScraping(true)
    setScrapeProgress({ stage: 'connecting', message: 'Connecting...' })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      toast({
        title: 'Error',
        description: 'You must be logged in to scrape websites',
        variant: 'destructive',
      })
      setIsScraping(false)
      setScrapeProgress(null)
      return
    }

    try {
      // Choose endpoint based on crawl mode
      const endpoint = crawlMode === 'full-site' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/bot/${botId}/crawl-site`
        : `${process.env.NEXT_PUBLIC_API_URL}/bot/${botId}/scrape-stream`
      
      const requestBody = crawlMode === 'full-site'
        ? { url: websiteUrl, max_pages: maxPages }
        : { url: websiteUrl }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Scraping failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No response body')
      }
      
      let finalData: any = null
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value)
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              setScrapeProgress(data)
              
              if (data.stage === 'complete') {
                finalData = data
              } else if (data.stage === 'error') {
                throw new Error(data.message)
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
      
      if (finalData) {
        const chunkInfo = finalData.chunk_details
        const crawlStats = finalData.crawl_stats
        
        if (crawlMode === 'full-site' && crawlStats) {
          toast({
            title: '✅ Site Crawled Successfully',
            description: `Crawled ${crawlStats.pages_with_content} pages, created ${chunkInfo?.total_chunks || 0} chunks. ${chunkInfo?.chunks_remaining || 0} chunks remaining.`,
          })
        } else {
          toast({
            title: '✅ Website Scraped Successfully',
            description: chunkInfo 
              ? `Created ${chunkInfo.total_chunks} chunks (${chunkInfo.scraped_content_size_kb || chunkInfo.total_content_size_kb} KB → ${chunkInfo.estimated_total_storage_kb} KB storage). ${chunkInfo.chunks_remaining} chunks remaining.`
              : 'Website content added to knowledge base',
          })
        }
      }

      setWebsiteUrl('')
      fetchDocuments()
      fetchStorageStats()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to scrape website',
        variant: 'destructive',
      })
    } finally {
      setIsScraping(false)
      setScrapeProgress(null)
    }
  }

  const copyApiKey = async () => {
    if (!bot) return
    await navigator.clipboard.writeText(bot.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveAppearance = async () => {
    if (!bot) return
    setIsSavingAppearance(true)
    
    try {
      const { error } = await supabase
        .from('bots')
        // @ts-ignore - Supabase type inference issue with JSONB
        .update({ appearance })
        .eq('id', botId)
      
      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Bot appearance saved successfully!',
      })
      fetchBot()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save appearance settings',
        variant: 'destructive',
      })
    } finally {
      setIsSavingAppearance(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (!bot) return null

  return (
    <div className="h-full flex flex-col">
      {/* Header - matching dashboard style */}
      <div className="p-6 lg:p-8 pb-0">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a0f1a] to-[#0a0f1a]/50 border border-white/5 p-6 mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/bots">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </Link>
              <div>
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Wand2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Bot Configuration</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{bot.name}</h1>
                <p className="text-gray-400 mt-1">{bot.description || 'No description'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-3 bg-[#030617] px-4 py-3 rounded-xl border border-white/10">
                <span className="text-sm text-gray-500">ID:</span>
                <code className="text-sm text-gray-300 font-mono">
                  {bot.id.slice(0, 8)}...
                </code>
                <button
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  onClick={async () => {
                    await navigator.clipboard.writeText(bot.id)
                    setCopiedId(true)
                    setTimeout(() => setCopiedId(false), 2000)
                  }}
                >
                  {copiedId ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center gap-3 bg-[#030617] px-4 py-3 rounded-xl border border-white/10">
                <span className="text-sm text-gray-500">API Key:</span>
                <code className="text-sm text-cyan-400 font-mono">
                  {bot.api_key.slice(0, 12)}...
                </code>
                <button
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  onClick={copyApiKey}
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs - styled like dashboard */}
        <div className="flex items-center justify-between gap-4 w-full flex-wrap">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#0a0f1a] border border-white/10 p-1.5 rounded-xl">
              <TabsTrigger
                value="builder"
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-[#030617] rounded-lg px-6 py-3 text-gray-400 font-medium text-sm transition-all"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                Builder
              </TabsTrigger>
              <TabsTrigger
                value="knowledge"
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-[#030617] rounded-lg px-6 py-3 text-gray-400 font-medium text-sm transition-all"
              >
                <Database className="h-5 w-5 mr-2" />
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-[#030617] rounded-lg px-6 py-3 text-gray-400 font-medium text-sm transition-all"
              >
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Storage Usage - Compact Full */}
          {storageStats && (
            <div className="bg-[#0a0f1a] border border-white/10 rounded-xl px-5 py-3 min-w-[360px]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${storageStats.usage.storage_percentage > 80 ? 'bg-red-500/20' : storageStats.usage.storage_percentage > 60 ? 'bg-yellow-500/20' : 'bg-cyan-500/20'}`}>
                    <Database className={`h-5 w-5 ${storageStats.usage.storage_percentage > 80 ? 'text-red-400' : storageStats.usage.storage_percentage > 60 ? 'text-yellow-400' : 'text-cyan-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-none font-heading">Storage Usage</p>
                    <p className="text-xs text-gray-500 mt-0.5">Knowledge base capacity</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-bold ${storageStats.usage.storage_percentage > 80 ? 'text-red-400' : storageStats.usage.storage_percentage > 60 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                    {storageStats.usage.storage_percentage.toFixed(1)}%
                  </span>
                  <p className="text-xs text-gray-500">used</p>
                </div>
              </div>
              <div className="w-full bg-[#030617] rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${storageStats.usage.storage_percentage > 80 ? 'bg-red-500' : storageStats.usage.storage_percentage > 60 ? 'bg-yellow-500' : 'bg-cyan-500'}`}
                  style={{ width: `${Math.min(storageStats.usage.storage_percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-gray-400">{storageStats.storage.total_mb.toFixed(2)} MB used</span>
                <span className="text-gray-500">{storageStats.limits.max_storage_mb} MB total</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'builder' && (
          <div className="flex-1 p-6 lg:p-8 pt-6">
            <div className="h-[calc(100vh-280px)] min-h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-[#030617] shadow-2xl shadow-black/50">
              <FlowBuilder
                initialNodes={bot.flow_data?.nodes}
                initialEdges={bot.flow_data?.edges}
                onSave={handleSaveFlow}
                botName={bot.name}
              />
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="p-6 lg:p-8 pt-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Top Stats Row - Horizontal Layout */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 animate-fade-in-up">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Documents</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{storageStats?.document_count || 0}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full transition-all duration-500" 
                          style={{ width: `${((storageStats?.document_count || 0) / (storageStats?.limits.max_documents || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{storageStats?.limits.max_documents || 0} max</span>
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 animate-fade-in-up animate-delay-100">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Globe className="h-4 w-4 text-cyan-400" />
                      </div>
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Websites</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{storageStats?.website_count || 0}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                          style={{ width: `${((storageStats?.website_count || 0) / (storageStats?.limits.max_websites || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{storageStats?.limits.max_websites || 0} max</span>
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-5 border border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 animate-fade-in-up animate-delay-200">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Database className="h-4 w-4 text-green-400" />
                      </div>
                      <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Chunks</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{storageStats?.chunk_count || 0}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 bg-green-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400 rounded-full transition-all duration-500" 
                          style={{ width: `${((storageStats?.chunk_count || 0) / (storageStats?.limits.max_chunks || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{storageStats?.limits.max_chunks || 0} max</span>
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl p-5 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 animate-fade-in-up animate-delay-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Database className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Storage</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{storageStats?.storage.total_mb.toFixed(1) || '0'}<span className="text-lg font-medium text-gray-400 ml-1">MB</span></p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 bg-purple-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-400 rounded-full transition-all duration-500" 
                          style={{ width: `${storageStats?.usage.storage_percentage || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{storageStats?.limits.max_storage_mb || 0} MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Left Column - Upload Section (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Document Upload Card */}
                  <div className="bg-[#0a0f1a]/80 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                          <Upload className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1 font-heading">Upload Documents</h3>
                          <p className="text-gray-400 text-sm">
                            Train your bot with PDF, TXT, DOCX or MD files
                          </p>
                        </div>
                      </div>
                      
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.txt,.docx,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label 
                        htmlFor="file-upload" 
                        className="group cursor-pointer flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-8 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300"
                      >
                        {isUploading ? (
                          <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
                        ) : (
                          <div className="p-4 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                            <Upload className="h-6 w-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        )}
                        <span className="text-white font-medium mt-4">
                          {isUploading ? 'Uploading...' : 'Drop files here'}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">or click to browse</span>
                      </label>
                      
                      <div className="flex items-center justify-center gap-2 mt-4">
                        {['PDF', 'TXT', 'MD', 'DOCX'].map((ext) => (
                          <span key={ext} className="text-[10px] px-2 py-1 bg-white/5 rounded text-gray-500 font-medium">
                            {ext}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Website Scraping Card */}
                  <div className="bg-[#0a0f1a]/80 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                          <Globe className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1 font-heading">Import from Web</h3>
                          <p className="text-gray-400 text-sm">
                            Crawl websites to extract content for training
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Crawl Mode Toggle */}
                        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                          <button
                            onClick={() => setCrawlMode('full-site')}
                            disabled={isScraping}
                            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                              crawlMode === 'full-site'
                                ? 'bg-cyan-500 text-[#030617]'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Full Site
                          </button>
                          <button
                            onClick={() => setCrawlMode('single')}
                            disabled={isScraping}
                            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                              crawlMode === 'single'
                                ? 'bg-cyan-500 text-[#030617]'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Single Page
                          </button>
                        </div>

                        {/* URL Input */}
                        <Input
                          type="url"
                          placeholder={crawlMode === 'full-site' 
                            ? "https://example.com"
                            : "https://example.com/page"}
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          disabled={isScraping}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-cyan-500/50 transition-all"
                        />
                        
                        <div className="flex gap-3">
                          {crawlMode === 'full-site' && (
                            <select
                              value={maxPages}
                              onChange={(e) => setMaxPages(Number(e.target.value))}
                              disabled={isScraping}
                              className="w-32 h-12 px-3 bg-[#0a0f1a] border border-white/10 rounded-lg text-white text-sm cursor-pointer focus:outline-none focus:border-cyan-500/50 hover:border-white/20 transition-colors"
                              style={{ 
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2300E5FF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, 
                                backgroundRepeat: 'no-repeat', 
                                backgroundPosition: 'right 12px center',
                                appearance: 'none'
                              }}
                            >
                              <option value={5} className="bg-[#0a0f1a] text-white">5 pages</option>
                              <option value={10} className="bg-[#0a0f1a] text-white">10 pages</option>
                              <option value={15} className="bg-[#0a0f1a] text-white">15 pages</option>
                              <option value={20} className="bg-[#0a0f1a] text-white">20 pages</option>
                            </select>
                          )}
                          <button
                            onClick={handleScrapeWebsite}
                            disabled={isScraping || !websiteUrl}
                            className="flex-1 h-12 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-[#030617] rounded-lg flex items-center justify-center gap-2 font-semibold transition-all"
                          >
                            {isScraping ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {crawlMode === 'full-site' ? 'Crawling...' : 'Scraping...'}
                              </>
                            ) : (
                              <>
                                <Globe className="h-4 w-4" />
                                {crawlMode === 'full-site' ? 'Crawl Site' : 'Scrape Page'}
                              </>
                            )}
                          </button>
                        </div>
                        
                        {/* Crawl Progress */}
                        {scrapeProgress && (
                          <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                              <span className="text-sm text-white font-medium">{scrapeProgress.message}</span>
                            </div>
                            
                            {(scrapeProgress.stage === 'crawling_page' || scrapeProgress.stage === 'crawling') && scrapeProgress.urls_total && (
                              <div className="space-y-2">
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${scrapeProgress.percent || 0}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Pages: {scrapeProgress.urls_crawled}/{scrapeProgress.urls_total}</span>
                                  <span>{Math.round(scrapeProgress.percent || 0)}%</span>
                                </div>
                              </div>
                            )}

                            {scrapeProgress.stage === 'embedding' && scrapeProgress.total && (
                              <div className="space-y-2">
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${scrapeProgress.percent || 0}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Embeddings: {scrapeProgress.current}/{scrapeProgress.total}</span>
                                  <span>{Math.round(scrapeProgress.percent || 0)}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          {crawlMode === 'full-site' 
                            ? 'Discovers pages via sitemap or internal links'
                            : 'Extracts text content from a single URL'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Documents List (3 cols) */}
                <div className="lg:col-span-3">
                  {/* Documents List */}
                  <div className="relative overflow-hidden bg-[#0a0f1a] rounded-2xl border border-white/10 h-full">
                    {/* Header */}
                    <div className="relative px-6 py-5 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                            <FileText className="h-6 w-6 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white font-heading tracking-wide">Knowledge Sources</h3>
                            <p className="text-sm text-gray-500 tracking-wide">{documents.length} {documents.length === 1 ? 'item' : 'items'} in your knowledge base</p>
                          </div>
                        </div>
                        {documents.length > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span className="text-xs font-medium text-green-400">Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative p-6">
                      {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          {/* Empty State Illustration */}
                          <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-2xl bg-[#030617] border border-white/10 flex items-center justify-center">
                              <Database className="h-10 w-10 text-gray-600" />
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30" />
                            <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-md bg-purple-500/20 border border-purple-500/30" />
                          </div>
                          
                          <h4 className="text-xl font-semibold text-white mb-3 font-heading">No Knowledge Sources Yet</h4>
                          <p className="text-sm text-gray-400 max-w-md mb-8 leading-relaxed">
                            Upload documents or scrape websites to build your chatbot's intelligent knowledge base. Your bot will use this data to answer questions.
                          </p>
                          
                          {/* Supported formats */}
                          <div className="flex flex-col items-center gap-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Supported formats</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-4 py-2 bg-[#030617] rounded-lg border border-white/10">
                                <FileText className="h-4 w-4 text-purple-400" />
                                <span className="text-sm text-gray-300">PDF, TXT, MD</span>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-[#030617] rounded-lg border border-white/10">
                                <Globe className="h-4 w-4 text-cyan-400" />
                                <span className="text-sm text-gray-300">Web Pages</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Divider with text */}
                          <div className="flex items-center gap-4 w-full max-w-sm mt-8">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-gray-500">Use the forms on the left to add sources</span>
                            <div className="flex-1 h-px bg-white/10" />
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-[420px] pr-2">
                          <div className="space-y-3">
                            {documents.map((doc, index) => (
                              <div
                                key={doc.id}
                                className="group relative overflow-x-auto overflow-y-hidden"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <div className="flex items-center gap-4 p-4 pr-24 bg-gradient-to-r from-[#030617] to-[#030617]/50 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:bg-[#030617]/80 transition-all duration-300 animate-fade-in-up"
                                >
                                {/* Left accent line */}
                                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-300 ${
                                  doc.file_type.includes('pdf') ? 'bg-red-500' :
                                  doc.file_type.includes('html') || doc.file_type.includes('web') || doc.file_type.includes('url') ? 'bg-cyan-500' :
                                  doc.file_type.includes('doc') ? 'bg-blue-500' :
                                  'bg-purple-500'
                                } opacity-50 group-hover:opacity-100`} />
                                
                                <div className={`relative p-2.5 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                                  doc.file_type.includes('pdf') ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20' :
                                  doc.file_type.includes('html') || doc.file_type.includes('web') || doc.file_type.includes('url') ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20' :
                                  doc.file_type.includes('doc') ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20' :
                                  'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20'
                                }`}>
                                  {doc.file_type.includes('html') || doc.file_type.includes('web') || doc.file_type.includes('url') ? (
                                    <Globe className="h-5 w-5 text-cyan-400" />
                                  ) : (
                                    <FileText className={`h-5 w-5 ${
                                      doc.file_type.includes('pdf') ? 'text-red-400' :
                                      doc.file_type.includes('doc') ? 'text-blue-400' :
                                      'text-purple-400'
                                    }`} />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white group-hover:text-cyan-50 transition-colors truncate">
                                    {doc.filename}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap flex-shrink-0">{formatFileSize(doc.file_size)}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                      <span className="text-cyan-400 font-medium">{doc.chunk_count}</span> chunks
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${
                                      doc.file_type.includes('pdf') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                      doc.file_type.includes('html') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                      doc.file_type.includes('doc') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                      'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    }`}>
                                      {doc.file_type.includes('html') ? 'WEB' : doc.file_type.split('/').pop()?.toUpperCase() || 'FILE'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Action buttons - absolutely positioned on the right */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-l from-[#030617] via-[#030617] to-transparent pl-12 pr-2 pointer-events-none group-hover:pointer-events-auto">
                                  <button
                                    onClick={() => handleViewDocument(doc.id)}
                                    className="p-2.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-cyan-500/20 flex-shrink-0"
                                    title="View content"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                                    className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/20 flex-shrink-0"
                                    title="Delete document"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 lg:p-8 pt-6 overflow-y-auto">
            <div className="max-w-6xl space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appearance Settings - Consolidated */}
                <div className="space-y-6">
                  <Card className="bg-[#0a0f1a] border-white/10 rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <Palette className="h-5 w-5 text-cyan-400" />
                        </div>
                        <CardTitle className="text-white text-lg">Appearance</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {/* Theme Colors - Compact Grid */}
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-3">Theme Colors</p>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { key: 'primary_color', label: 'Button' },
                            { key: 'secondary_color', label: 'Accent' },
                            { key: 'header_color', label: 'Header' },
                            { key: 'background_color', label: 'Chat BG' },
                          ].map((item) => (
                            <div key={item.key} className="text-center">
                              <input
                                type="color"
                                value={(appearance as any)[item.key]}
                                onChange={(e) => setAppearance({...appearance, [item.key]: e.target.value})}
                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/10 bg-transparent mx-auto block"
                              />
                              <span className="text-xs text-gray-400 mt-1 block">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Bubble Colors - Compact */}
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-sm font-medium text-gray-300 mb-3">Message Bubbles</p>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { key: 'user_bubble_color', label: 'User' },
                            { key: 'bot_bubble_color', label: 'Bot' },
                            { key: 'user_text_color', label: 'User Text' },
                            { key: 'bot_text_color', label: 'Bot Text' },
                          ].map((item) => (
                            <div key={item.key} className="text-center">
                              <input
                                type="color"
                                value={(appearance as any)[item.key]}
                                onChange={(e) => setAppearance({...appearance, [item.key]: e.target.value})}
                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/10 bg-transparent mx-auto block"
                              />
                              <span className="text-xs text-gray-400 mt-1 block">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Branding - Inline */}
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-sm font-medium text-gray-300 mb-3">Branding</p>
                        <div className="flex gap-4 items-start">
                          {/* Avatar */}
                          <div className="text-center relative">
                            <label className="cursor-pointer group">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, 'avatar') }} />
                              <div className="relative inline-block">
                                {appearance.avatar_type === 'image' && appearance.avatar_url ? (
                                  <img src={appearance.avatar_url} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500 group-hover:opacity-80 transition-opacity" />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-[#030617] border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                                    {isUploadingImage === 'avatar' ? <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" /> : <ImageIcon className="h-5 w-5 text-gray-500 group-hover:text-cyan-500 transition-colors" />}
                                  </div>
                                )}
                                {appearance.avatar_url && (
                                  <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAppearance({...appearance, avatar_url: null, avatar_type: 'default'}) }} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 hover:bg-red-600 z-10 cursor-pointer">
                                    <X className="h-2.5 w-2.5 text-white" />
                                  </span>
                                )}
                              </div>
                              <span className="block mt-1.5 text-xs text-gray-400 group-hover:text-cyan-400 transition-colors">Avatar</span>
                            </label>
                          </div>
                          
                          {/* Widget Icon */}
                          <div className="text-center relative">
                            <label className="cursor-pointer group">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, 'widget_icon') }} />
                              <div className="relative inline-block">
                                {appearance.widget_icon_url ? (
                                  <img src={appearance.widget_icon_url} alt="Icon" className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-500 group-hover:opacity-80 transition-opacity" />
                                ) : (
                                  <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:opacity-80 transition-opacity" style={{ background: `linear-gradient(135deg, ${appearance.primary_color} 0%, ${appearance.secondary_color} 100%)` }}>
                                    {isUploadingImage === 'widget_icon' ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <MessageSquare className="h-5 w-5 text-white" />}
                                  </div>
                                )}
                                {appearance.widget_icon_url && (
                                  <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAppearance({...appearance, widget_icon_url: null}) }} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 hover:bg-red-600 z-10 cursor-pointer">
                                    <X className="h-2.5 w-2.5 text-white" />
                                  </span>
                                )}
                              </div>
                              <span className="block mt-1.5 text-xs text-gray-400 group-hover:text-cyan-400 transition-colors">Widget</span>
                            </label>
                          </div>

                          {/* Loading Animation */}
                          <div className="text-center relative">
                            <label className="cursor-pointer group">
                              <input type="file" accept="image/gif,video/mp4,video/webm,.gif,.mp4,.webm" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, 'loading_animation') }} />
                              <div className="relative inline-block">
                                {appearance.loading_animation_url ? (
                                  appearance.loading_animation_url.includes('.mp4') || appearance.loading_animation_url.includes('.webm') ? (
                                    <video src={appearance.loading_animation_url} autoPlay loop muted playsInline className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-500 group-hover:opacity-80 transition-opacity" />
                                  ) : (
                                    <img src={appearance.loading_animation_url} alt="Loading" className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-500 group-hover:opacity-80 transition-opacity" />
                                  )
                                ) : (
                                  <div className="w-14 h-14 rounded-xl bg-[#030617] border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                                    {isUploadingImage === 'loading_animation' ? <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" /> : <Loader2 className="h-5 w-5 text-gray-500 group-hover:text-cyan-500 transition-colors" />}
                                  </div>
                                )}
                                {appearance.loading_animation_url && (
                                  <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAppearance({...appearance, loading_animation_url: null}) }} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 hover:bg-red-600 z-10 cursor-pointer">
                                    <X className="h-2.5 w-2.5 text-white" />
                                  </span>
                                )}
                              </div>
                              <span className="block mt-1.5 text-xs text-gray-400 group-hover:text-cyan-400 transition-colors">Loading</span>
                            </label>
                          </div>

                          {/* Title & Subtitle */}
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Chat title"
                              value={appearance.chat_title}
                              onChange={(e) => setAppearance({...appearance, chat_title: e.target.value})}
                              className="bg-[#030617] border-white/10 text-white text-sm h-9"
                            />
                            <Input
                              placeholder="Subtitle (optional)"
                              value={appearance.chat_subtitle || ''}
                              onChange={(e) => setAppearance({...appearance, chat_subtitle: e.target.value})}
                              className="bg-[#030617] border-white/10 text-white text-sm h-9"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Widget Style - Compact */}
                      <div className="pt-3 border-t border-white/10">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Loading Style</p>
                            <div className="flex flex-wrap gap-1">
                              {['dots', 'spinner', 'pulse', 'skeleton'].map((style) => (
                                <button
                                  key={style}
                                  onClick={() => setAppearance({...appearance, loading_style: style as any})}
                                  className={`px-2 py-1 rounded text-xs transition-colors ${
                                    appearance.loading_style === style
                                      ? 'bg-cyan-500 text-white'
                                      : 'bg-[#030617] text-gray-400 hover:text-white border border-white/10'
                                  }`}
                                >
                                  {style.charAt(0).toUpperCase() + style.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Button Shape</p>
                            <div className="flex gap-1">
                              {['round', 'square', 'pill'].map((style) => (
                                <button
                                  key={style}
                                  onClick={() => setAppearance({...appearance, button_style: style as any})}
                                  className={`px-2 py-1 rounded text-xs transition-colors ${
                                    appearance.button_style === style
                                      ? 'bg-cyan-500 text-white'
                                      : 'bg-[#030617] text-gray-400 hover:text-white border border-white/10'
                                  }`}
                                >
                                  {style.charAt(0).toUpperCase() + style.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Position</p>
                            <div className="flex gap-1">
                              {['bottom-right', 'bottom-left'].map((pos) => (
                                <button
                                  key={pos}
                                  onClick={() => setAppearance({...appearance, position: pos as any})}
                                  className={`px-2 py-1 rounded text-xs transition-colors ${
                                    appearance.position === pos
                                      ? 'bg-cyan-500 text-white'
                                      : 'bg-[#030617] text-gray-400 hover:text-white border border-white/10'
                                  }`}
                                >
                                  {pos === 'bottom-right' ? 'Right' : 'Left'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveAppearance}
                    disabled={isSavingAppearance}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {isSavingAppearance ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Appearance
                      </>
                    )}
                  </Button>
                </div>

                {/* Live Preview */}
                <div className="lg:sticky lg:top-6">
                  <Card className="bg-[#0a0f1a] border-white/10 rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Eye className="h-5 w-5 text-purple-400" />
                        </div>
                        <CardTitle className="text-white text-lg">Live Preview</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Widget Preview Container */}
                      <div className="relative bg-gray-900 rounded-lg p-4 min-h-[500px]">
                        {/* Chat Window Preview */}
                        <div 
                          className="w-80 rounded-lg shadow-2xl overflow-hidden mx-auto"
                          style={{ backgroundColor: appearance.background_color }}
                        >
                          {/* Header */}
                          <div 
                            className="p-4 flex items-center gap-3"
                            style={{ backgroundColor: appearance.header_color }}
                          >
                            {/* Avatar */}
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: appearance.primary_color }}
                            >
                              {appearance.avatar_type === 'initials' 
                                ? (appearance.avatar_initials || 'B')
                                : appearance.avatar_type === 'image' && appearance.avatar_url
                                  ? <img src={appearance.avatar_url} className="w-full h-full rounded-full object-cover" alt="Bot" />
                                  : '🤖'
                              }
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold text-sm">{appearance.chat_title}</p>
                              {appearance.chat_subtitle && (
                                <p className="text-white/70 text-xs">{appearance.chat_subtitle}</p>
                              )}
                            </div>
                            <button className="text-white/70 hover:text-white">
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Messages Area */}
                          <div className="p-4 space-y-3 min-h-[250px]">
                            {/* Bot Message */}
                            <div className="flex gap-2">
                              <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 overflow-hidden"
                                style={{ 
                                  backgroundColor: appearance.background_color, 
                                  color: '#fff' 
                                }}
                              >
                                {appearance.avatar_type === 'image' && appearance.avatar_url ? (
                                  <img src={appearance.avatar_url} className="w-full h-full object-cover" alt="Bot" />
                                ) : appearance.avatar_type === 'initials' && appearance.avatar_initials ? (
                                  appearance.avatar_initials
                                ) : '🤖'}
                              </div>
                              <div 
                                className="rounded-lg p-3 max-w-[80%] border border-white/10"
                                style={{ 
                                  backgroundColor: appearance.bot_bubble_color,
                                  color: appearance.bot_text_color 
                                }}
                              >
                                <p className="text-sm">Hello! How can I help you today?</p>
                              </div>
                            </div>

                            {/* User Message */}
                            <div className="flex gap-2 justify-end">
                              <div 
                                className="rounded-lg p-3 max-w-[80%]"
                                style={{ 
                                  backgroundColor: appearance.user_bubble_color,
                                  color: appearance.user_text_color 
                                }}
                              >
                                <p className="text-sm">Hi, I have a question!</p>
                              </div>
                            </div>

                            {/* Loading Animation Preview */}
                            <div className="flex gap-2">
                              <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 overflow-hidden"
                                style={{ 
                                  backgroundColor: appearance.background_color, 
                                  color: '#fff' 
                                }}
                              >
                                {/* Show custom animation in avatar if URL exists */}
                                {appearance.loading_animation_url ? (
                                  appearance.loading_animation_url.includes('.mp4') || appearance.loading_animation_url.includes('.webm') ? (
                                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                      <source src={appearance.loading_animation_url} type="video/mp4" />
                                    </video>
                                  ) : (
                                    <img src={appearance.loading_animation_url} alt="Loading" className="w-full h-full object-cover" />
                                  )
                                ) : (
                                  appearance.avatar_type === 'image' && appearance.avatar_url ? (
                                    <img src={appearance.avatar_url} alt="Bot" className="w-full h-full object-cover" />
                                  ) : appearance.avatar_type === 'initials' ? (
                                    appearance.avatar_initials?.[0] || 'B'
                                  ) : '🤖'
                                )}
                              </div>
                              <div 
                                className="rounded-lg p-3 border border-white/10"
                                style={{ backgroundColor: appearance.bot_bubble_color }}
                              >
                                {/* Loading style always shows in bubble */}
                                {appearance.loading_style === 'dots' ? (
                                  <div className="flex gap-1">
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: appearance.bot_text_color, animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: appearance.bot_text_color, animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: appearance.bot_text_color, animationDelay: '300ms' }}></span>
                                  </div>
                                ) : appearance.loading_style === 'spinner' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: appearance.bot_text_color }} />
                                ) : appearance.loading_style === 'pulse' ? (
                                  <div className="w-16 h-4 rounded animate-pulse" style={{ backgroundColor: appearance.bot_text_color + '40' }}></div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="w-24 h-3 rounded animate-pulse" style={{ backgroundColor: appearance.bot_text_color + '40' }}></div>
                                    <div className="w-16 h-3 rounded animate-pulse" style={{ backgroundColor: appearance.bot_text_color + '40' }}></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Input Area */}
                          <div className="p-3 border-t" style={{ borderColor: appearance.header_color + '40' }}>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type your message..."
                                className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 outline-none"
                                readOnly
                              />
                              <button 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: appearance.primary_color }}
                              >
                                <Send className="h-4 w-4 text-white" />
                              </button>
                            </div>
                            {/* Powered by - Always visible */}
                            <p className="text-center text-xs text-white/40 mt-2">
                              Powered by UniverBot
                            </p>
                          </div>
                        </div>

                        {/* Toggle Button Preview */}
                        <div 
                          className={`absolute ${appearance.position === 'bottom-right' ? 'right-4' : 'left-4'} bottom-4`}
                        >
                          <button
                            className={`shadow-lg flex items-center justify-center text-white overflow-hidden ${
                              appearance.button_style === 'round' ? 'w-14 h-14 rounded-full' :
                              appearance.button_style === 'square' ? 'w-14 h-14 rounded-xl' :
                              'w-14 h-14 rounded-[30px]'
                            }`}
                            style={{ backgroundColor: appearance.primary_color }}
                          >
                            {appearance.widget_icon_url ? (
                              <img src={appearance.widget_icon_url} alt="Widget" className="w-full h-full object-cover" />
                            ) : (
                              <MessageSquare className="h-6 w-6" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 text-center mt-4">
                        💡 The "Powered by UniverBot" branding will always be shown
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Content Viewer Dialog */}
      <Dialog open={!!viewingDocument || isLoadingDocument} onOpenChange={(open) => {
        if (!open) {
          setViewingDocument(null)
          setViewMode('full')
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-[#0d1117] border border-[#30363d] text-white p-0 overflow-hidden rounded-lg shadow-xl [&>button]:hidden">
          {isLoadingDocument ? (
            <div className="flex items-center justify-center h-[450px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#58a6ff]" />
                <span className="text-sm text-[#8b949e]">Loading document...</span>
              </div>
            </div>
          ) : viewingDocument && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    viewingDocument.document.file_type.includes('html') 
                      ? 'bg-[#238636]/20' 
                      : 'bg-[#8957e5]/20'
                  }`}>
                    {viewingDocument.document.file_type.includes('html') ? (
                      <Globe className="h-4 w-4 text-[#3fb950]" />
                    ) : (
                      <FileText className="h-4 w-4 text-[#a371f7]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-sm font-semibold text-[#c9d1d9] truncate">
                      {viewingDocument.document.filename}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#8b949e] mt-0.5">
                      {formatFileSize(viewingDocument.document.file_size)} • <span className="text-[#58a6ff]">{viewingDocument.document.chunk_count} chunks</span> • {viewingDocument.total_characters.toLocaleString()} chars
                    </DialogDescription>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setViewingDocument(null)
                    setViewMode('full')
                  }}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Tab Bar */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-[#0d1117] border-b border-[#30363d] flex-shrink-0">
                <button
                  onClick={() => setViewMode('full')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'full' 
                      ? 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d]' 
                      : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50 border border-transparent'
                  }`}
                >
                  Full Content
                </button>
                <button
                  onClick={() => setViewMode('chunks')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'chunks' 
                      ? 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d]' 
                      : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50 border border-transparent'
                  }`}
                >
                  Chunks ({viewingDocument.chunks.length})
                </button>
              </div>
              
              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full max-h-[calc(90vh-140px)]">
                  <div className="p-5">
                    {viewMode === 'full' ? (
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-md overflow-hidden">
                        <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
                          <span className="text-xs text-[#8b949e] font-medium">content.txt</span>
                          <span className="text-xs text-[#8b949e]">{viewingDocument.total_characters.toLocaleString()} characters</span>
                        </div>
                        <div className="p-4 overflow-auto">
                          <pre className="text-sm text-[#c9d1d9] whitespace-pre-wrap leading-6 font-mono">
                            {viewingDocument.full_content}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {viewingDocument.chunks.map((chunk, index) => (
                          <div 
                            key={chunk.id}
                            className="bg-[#0d1117] border border-[#30363d] rounded-md overflow-hidden"
                          >
                            <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-[#58a6ff]">#{index + 1}</span>
                                <span className="text-xs text-[#8b949e]">Chunk {chunk.chunk_index + 1}</span>
                              </div>
                              <span className="text-xs text-[#8b949e]">{chunk.char_count.toLocaleString()} chars</span>
                            </div>
                            <div className="p-4">
                              <pre className="text-sm text-[#c9d1d9] whitespace-pre-wrap leading-6 font-mono">
                                {chunk.content}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Footer */}
              {viewingDocument.document.file_type.includes('html') && viewingDocument.document.file_path && (
                <div className="px-5 py-3 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2 flex-shrink-0">
                  <Globe className="h-3.5 w-3.5 text-[#8b949e] flex-shrink-0" />
                  <a 
                    href={viewingDocument.document.file_path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-[#58a6ff] hover:underline truncate flex-1"
                  >
                    {viewingDocument.document.file_path}
                  </a>
                  <ExternalLink className="h-3 w-3 text-[#8b949e] flex-shrink-0" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
