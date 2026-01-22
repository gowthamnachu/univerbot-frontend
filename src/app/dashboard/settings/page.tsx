'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { User, Mail, Loader2, Shield, Key, Bell, Palette, AlertTriangle, Check, Sparkles } from 'lucide-react'

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setFullName(user.user_metadata?.full_name || '')
      }
      setIsLoading(false)
    }
    getUser()
  }, [supabase.auth])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  const settingsSections = [
    { icon: Bell, title: 'Notifications', description: 'Configure email notifications', coming: true },
    { icon: Key, title: 'API Keys', description: 'Manage your API access', coming: true },
    { icon: Palette, title: 'Appearance', description: 'Theme and display settings', coming: true },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a0f1a] to-[#0a0f1a]/50 border border-white/5 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 text-cyan-400 mb-3">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Account Settings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-lg mt-2">
            Manage your account preferences and settings
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="bg-[#0a0f1a]/80 border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
        <CardHeader className="relative border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#030617]">
                {fullName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0a0f1a] flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl text-white">{fullName || 'Your Profile'}</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                {email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="h-12 bg-[#030617]/50 border-white/10 text-white focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                Email Address
              </Label>
              <Input
                id="email"
                value={email}
                disabled
                className="h-12 bg-[#030617]/50 border-white/10 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              className="h-12 px-8 bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold btn-shine shadow-lg shadow-cyan-500/20 transition-all duration-300"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Card */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Free Plan</h3>
                <p className="text-sm text-gray-400">2 bots • 500 messages/month • 5 documents per bot</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
              disabled
            >
              Upgrade Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {settingsSections.map((section, index) => (
          <Card 
            key={section.title} 
            className="bg-[#0a0f1a]/80 border-white/5 hover:border-white/10 transition-all duration-300 cursor-not-allowed opacity-60"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <section.icon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{section.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-500 rounded-full">Soon</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Danger Zone */}
      <Card className="bg-[#0a0f1a]/80 border-red-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-gray-400">
                Irreversible actions for your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-gray-400 mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}