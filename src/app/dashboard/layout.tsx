'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useBotStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bot, Home, Settings, LogOut, Menu, X, ChevronLeft } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    getUser()
  }, [router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/bots', icon: Bot, label: 'My Bots' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#030617] flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
        className={`fixed lg:fixed inset-y-0 left-0 z-50 bg-[#0a0f1a] border-r border-white/10 flex flex-col transition-all duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'} w-64`}
      >
        {/* Logo */}
        <div className={`h-24 flex items-center border-b border-white/10 ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''} px-5`}>
          <Link href="/dashboard" className="flex items-center gap-4">
            <Image src="/univerbot_logo.png" alt="UniverBot" width={48} height={48} className="flex-shrink-0" />
            <span className={`text-2xl font-bold text-white transition-all duration-200 font-[family-name:var(--font-ovo)] ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              UniverBot
            </span>
          </Link>
          <button
            className="lg:hidden ml-auto p-2 text-gray-400 hover:text-white rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  sidebarCollapsed ? 'lg:justify-center' : ''
                } ${
                  active 
                    ? 'bg-cyan-500/10 text-cyan-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={`text-sm font-medium transition-all duration-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-cyan-500 text-[#030617] text-xs font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 text-left min-w-0 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56 bg-[#0a0f1a] border-white/10 mb-2">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer text-gray-300 hover:text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Top bar - Mobile */}
        <header className="h-16 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 lg:hidden sticky top-0 z-30">
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/univerbot_logo.png" alt="UniverBot" width={28} height={28} />
            <span className="font-bold text-white">UniverBot</span>
          </Link>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-grid">
          <div className="h-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
