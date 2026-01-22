'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBotStore } from '@/store'
import { generateApiKey } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Bot, Loader2, ArrowLeft, Sparkles, Lightbulb, Wand2 } from 'lucide-react'
import Link from 'next/link'

export default function CreateBotPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful assistant. Answer questions based on the provided context. If you don\'t know the answer, say so.'
  )
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { addBot } = useBotStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Try to create profile if it doesn't exist (upsert)
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || '',
        }, {
          onConflict: 'id',
          ignoreDuplicates: true,
        })

      const apiKey = generateApiKey()

      const { data, error } = await supabase
        .from('bots')
        .insert({
          user_id: user.id,
          name,
          description,
          system_prompt: systemPrompt,
          api_key: apiKey,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      addBot(data)
      toast({
        title: 'Success',
        description: 'Bot created successfully!',
      })
      router.push(`/dashboard/bots/${data.id}`)
    } catch (error) {
      console.error('Error creating bot:', error)
      toast({
        title: 'Error',
        description: 'Failed to create bot. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const promptTemplates = [
    {
      title: 'Customer Support',
      prompt: 'You are a friendly and professional customer support agent. Help users with their questions about our products and services. Be patient, empathetic, and provide clear solutions. If you cannot help, offer to escalate to a human agent.'
    },
    {
      title: 'Knowledge Base',
      prompt: 'You are a knowledgeable assistant that answers questions based on the provided documentation. Always cite specific sections when possible. If the answer is not in the provided context, clearly state that you don\'t have that information.'
    },
    {
      title: 'Sales Assistant',
      prompt: 'You are an enthusiastic sales assistant. Help customers understand our products, answer pricing questions, and guide them towards the best solution for their needs. Be helpful but not pushy.'
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bots">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Bot</h1>
          <p className="text-gray-400 mt-1">Set up a new AI chatbot in minutes</p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="bg-[#0a0f1a]/80 border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
        <CardHeader className="relative border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Bot className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Bot Configuration</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Configure your chatbot's identity and behavior
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm font-medium">
                Bot Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Support Bot, Sales Assistant"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300"
              />
              <p className="text-xs text-gray-500">
                Choose a descriptive name for your chatbot
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white text-sm font-medium">
                Description
              </Label>
              <Input
                id="description"
                placeholder="e.g., Helps customers with product questions"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="systemPrompt" className="text-white text-sm font-medium">
                  System Prompt <span className="text-red-400">*</span>
                </Label>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Lightbulb className="h-3 w-3" />
                  <span>Defines bot personality</span>
                </div>
              </div>
              <Textarea
                id="systemPrompt"
                placeholder="You are a helpful assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                required
                rows={5}
                className="bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 resize-none transition-all duration-300"
              />
              <p className="text-xs text-gray-500">
                This prompt defines how your chatbot behaves and responds to users.
              </p>
            </div>

            {/* Prompt Templates */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Wand2 className="h-4 w-4" />
                <span>Quick Templates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {promptTemplates.map((template) => (
                  <button
                    key={template.title}
                    type="button"
                    onClick={() => setSystemPrompt(template.prompt)}
                    className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all duration-200 group"
                  >
                    <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                      {template.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <Link href="/dashboard/bots" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-white/10 text-white hover:bg-white/5 hover:border-white/20"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 h-12 bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold btn-shine shadow-lg shadow-cyan-500/20 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Bot
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-cyan-500/5 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Lightbulb className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Next Steps</h4>
              <p className="text-sm text-gray-400">
                After creating your bot, you can train it by uploading documents or adding website URLs. 
                Then customize its appearance and embed it on your website.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
