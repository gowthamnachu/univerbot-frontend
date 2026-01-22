'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Bot, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Bot, text: 'Build intelligent AI chatbots' },
    { icon: Sparkles, text: 'Train with your own data' },
    { icon: Shield, text: 'Secure & private' },
    { icon: Zap, text: 'Deploy in minutes' },
  ]

  return (
    <div className="min-h-screen bg-[#030617] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-grid gradient-overlay relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12 animate-fade-in-up">
            <div className="p-3 bg-cyan-500/10 rounded-xl animate-pulse-glow">
              <Image src="/univerbot_logo.png" alt="UniverBot" width={48} height={48} />
            </div>
            <span className="text-3xl font-bold text-white">UniverBot</span>
          </Link>

          {/* Hero text */}
          <div className="space-y-6 animate-fade-in-up animate-delay-100">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Welcome back to your
              <span className="text-cyan-400 text-glow block mt-2">AI Command Center</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md">
              Access your intelligent chatbots and continue building amazing experiences.
            </p>
          </div>

          {/* Features list */}
          <div className="mt-12 space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <feature.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Decorative element */}
          <div className="absolute bottom-10 left-12 xl:left-20 animate-fade-in-up animate-delay-500">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-8 h-[1px] bg-gray-500" />
              <span>Trusted by developers worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Image src="/univerbot_logo.png" alt="UniverBot" width={40} height={40} />
            </div>
            <span className="text-2xl font-bold text-white">UniverBot</span>
          </div>

          <Card className="bg-[#0a0f1a]/80 border-white/10 backdrop-blur-xl gradient-border">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-white">Sign in</CardTitle>
              <CardDescription className="text-gray-400">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white text-sm font-medium">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-6 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold text-base btn-shine transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0a0f1a] px-4 text-gray-500">or</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm text-center">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    Create one free
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600 mt-8">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-gray-500 hover:text-gray-400 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-gray-500 hover:text-gray-400 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
