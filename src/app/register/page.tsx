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
import { Loader2, Bot, Sparkles, Shield, Zap, ArrowRight, Check } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      // Profile is automatically created by database trigger (handle_new_user)

      toast({
        title: 'Success',
        description: 'Account created! Please check your email to verify.',
      })

      router.push('/login')
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

  const benefits = [
    'Create up to 2 AI chatbots for free',
    'Train with documents & websites',
    'Embed on any website',
    'No credit card required',
  ]

  return (
    <div className="min-h-screen bg-[#030617] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-grid gradient-overlay relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-32 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 left-20 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
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
              Start building your
              <span className="text-cyan-400 text-glow block mt-2">AI Chatbot today</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md">
              Join thousands of developers creating intelligent chatbots powered by their own data.
            </p>
          </div>

          {/* Benefits list */}
          <div className="mt-12 space-y-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="p-1.5 bg-cyan-500/20 rounded-full">
                  <Check className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 animate-fade-in-up animate-delay-500">
            <div>
              <p className="text-3xl font-bold text-cyan-400">1000+</p>
              <p className="text-sm text-gray-500 mt-1">Bots Created</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">50K+</p>
              <p className="text-sm text-gray-500 mt-1">Messages Sent</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">99.9%</p>
              <p className="text-sm text-gray-500 mt-1">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
              <CardTitle className="text-2xl font-bold text-white">Create account</CardTitle>
              <CardDescription className="text-gray-400">
                Start building your AI chatbots in minutes
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white text-sm font-medium">
                    Full name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                </div>
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
                    className="h-11 bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                  <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 bg-[#030617]/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-5 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold text-base btn-shine transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <p className="text-gray-400 text-sm text-center">
                  Already have an account?{' '}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600 mt-8">
            By creating an account, you agree to our{' '}
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
