'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useBotStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Bot, Plus, Search, Trash2, Settings, MoreVertical, Sparkles, AlertTriangle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function BotsPage() {
  const { bots, setBots, removeBot, isLoading, setLoading } = useBotStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [botToDelete, setBotToDelete] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchBots = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('bots')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (data) {
          setBots(data)
        }
      } catch (error) {
        console.error('Error fetching bots:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBots()
  }, [supabase, setBots, setLoading])

  const handleDeleteBot = async () => {
    if (!botToDelete) return

    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botToDelete)

      if (error) throw error

      removeBot(botToDelete)
      toast({
        title: 'Success',
        description: 'Bot deleted successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bot.',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setBotToDelete(null)
    }
  }

  const filteredBots = bots.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const botToDeleteName = bots.find(b => b.id === botToDelete)?.name

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a0f1a] to-[#0a0f1a]/50 border border-white/5 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">{bots.length}/2 bots used</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">My Bots</h1>
            <p className="text-gray-400 text-lg">
              Create and manage your AI chatbots
            </p>
          </div>
          <Link href="/dashboard/bots/create">
            <Button 
              className="bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold h-12 px-6 btn-shine shadow-lg shadow-cyan-500/20 transition-all duration-300"
              disabled={bots.length >= 2}
            >
              <Plus className="mr-2 h-5 w-5" />
              {bots.length >= 2 ? 'Limit Reached' : 'Create Bot'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search bots..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 bg-[#0a0f1a]/80 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300"
        />
      </div>

      {/* Bots Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-[#0a0f1a]/80 border-white/5 animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-white/10 rounded w-2/3" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-white/10 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBots.length === 0 ? (
        <Card className="bg-[#0a0f1a]/80 border-white/5 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No bots found' : 'No bots yet'}
            </h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search term or create a new bot.'
                : 'Create your first AI chatbot to get started. Train it with your data and embed it anywhere.'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/bots/create">
                <Button className="bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold btn-shine">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Bot
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBots.map((bot, index) => (
            <Card 
              key={bot.id} 
              className="bg-[#0a0f1a]/80 border-white/5 hover:border-cyan-500/30 transition-all duration-300 card-hover group animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Link href={`/dashboard/bots/${bot.id}`} className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
                      <Bot className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-lg group-hover:text-cyan-400 transition-colors truncate">
                        {bot.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400 line-clamp-2 mt-1">
                        {bot.description || 'No description provided'}
                      </CardDescription>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-white hover:bg-white/5 -mr-2"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0f1a] border-white/10">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/bots/${bot.id}`} className="cursor-pointer text-white hover:text-cyan-400">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
                        onClick={() => {
                          setBotToDelete(bot.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    bot.is_active 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${bot.is_active ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    {bot.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(bot.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0a0f1a] border-white/10">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <DialogTitle className="text-xl text-white">Delete Bot</DialogTitle>
            </div>
            <DialogDescription className="text-gray-400 text-base">
              Are you sure you want to delete <span className="text-white font-medium">{botToDeleteName}</span>? This action cannot be undone and will permanently delete all associated documents and chat history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBot}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Bot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
