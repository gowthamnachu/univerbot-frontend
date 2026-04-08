'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useBotStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Plus, MessageSquare, FileText, TrendingUp, Sparkles, ArrowRight, Zap } from 'lucide-react'
import type { Bot as BotType } from '@/types/database'

export default function DashboardPage() {
  const { bots, setBots, isLoading, setLoading } = useBotStore()
  const [stats, setStats] = useState({
    totalBots: 0,
    totalMessages: 0,
    totalDocuments: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Workaround for auth-helpers + custom Database type mismatch in this project.
        const db = supabase as any

        // Fetch bots
        const { data: botsDataRaw } = await db
          .from('bots')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        const botsData = (botsDataRaw || []) as any[]
        const botIds = botsData
          .map((b: any) => b?.id)
          .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)

        setBots(botsData as BotType[])
        setStats((prev) => ({ ...prev, totalBots: botsData.length }))

        if (botIds.length === 0) {
          setStats((prev) => ({ ...prev, totalDocuments: 0, totalMessages: 0 }))
          return
        }

        // Fetch documents count
        const { count: docsCount } = await db
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .in('bot_id', botIds)

        setStats((prev) => ({ ...prev, totalDocuments: docsCount || 0 }))

        // Fetch messages count
        const { count: msgsCount } = await db
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .in('bot_id', botIds)

        setStats((prev) => ({ ...prev, totalMessages: msgsCount || 0 }))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, setBots, setLoading])

  const statCards = [
    {
      title: 'Active Bots',
      value: `${stats.totalBots}/2`,
      icon: Bot,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      subtitle: 'Free tier limit',
      gradient: 'from-cyan-500/20 to-transparent'
    },
    {
      title: 'Messages',
      value: stats.totalMessages.toLocaleString(),
      icon: MessageSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      subtitle: '500/bot/month',
      gradient: 'from-green-500/20 to-transparent'
    },
    {
      title: 'Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      subtitle: '5 per bot',
      gradient: 'from-purple-500/20 to-transparent'
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a0f1a] to-[#0a0f1a]/50 border border-white/5 p-8">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Free Plan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white font-heading">
              Welcome to your Dashboard
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Build, train, and deploy intelligent AI chatbots powered by your own knowledge base.
            </p>
          </div>
          <Link href="/dashboard/bots/create">
            <Button 
              className="bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold h-12 px-6 btn-shine shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/30"
              disabled={stats.totalBots >= 2}
            >
              <Plus className="mr-2 h-5 w-5" />
              {stats.totalBots >= 2 ? 'Limit Reached' : 'Create New Bot'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card 
            key={stat.title} 
            className={`bg-[#0a0f1a]/80 border-white/5 hover:border-white/10 transition-all duration-300 card-hover overflow-hidden animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${stat.color.replace('text-', 'bg-')}`}
                        style={{ 
                          width: stat.title === 'Active Bots' 
                            ? `${(stats.totalBots / 2) * 100}%` 
                            : stat.title === 'Chat Messages'
                            ? `${Math.min((stats.totalMessages / 500) * 100, 100)}%`
                            : stat.title === 'Documents'
                            ? `${Math.min((stats.totalDocuments / 5) * 100, 100)}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor} icon-container`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0a0f1a]/80 border-white/5 hover:border-cyan-500/30 transition-all duration-300 card-hover group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
                <Zap className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Quick Start Guide</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Learn how to create your first bot and train it with your data in minutes.
                </p>
                <Link href="/dashboard/bots/create" className="inline-flex items-center text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors group/link">
                  Get started
                  <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0f1a]/80 border-white/5 hover:border-purple-500/30 transition-all duration-300 card-hover group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Usage Analytics</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Track conversations, user engagement, and bot performance metrics.
                </p>
                <span className="inline-flex items-center text-gray-500 text-sm font-medium">
                  Coming soon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bots */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Your Bots</h2>
            <p className="text-sm text-gray-400 mt-1">Manage and configure your AI chatbots</p>
          </div>
          <Link href="/dashboard/bots">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 group">
              View All
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#0a0f1a]/80 border-white/5 animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-white/10 rounded w-2/3" />
                      <div className="h-4 bg-white/10 rounded w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-white/10 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bots.length === 0 ? (
          <Card className="bg-[#0a0f1a]/80 border-white/5 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No bots yet</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Create your first AI chatbot to get started. Train it with your data and embed it anywhere.
              </p>
              <Link href="/dashboard/bots/create">
                <Button className="bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold btn-shine">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Bot
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.slice(0, 6).map((bot, index) => (
              <Link key={bot.id} href={`/dashboard/bots/${bot.id}`}>
                <Card 
                  className="bg-[#0a0f1a]/80 border-white/5 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer card-hover group h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
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
                        {new Date(bot.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
