import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Zap, Shield, Code, Bot } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030617]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#030617]/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/univerbot_logo.png" alt="UniverBot" width={40} height={40} />
            <span className="text-2xl font-bold text-white">UniverBot</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="text-white hover:text-cyan-500 px-4 py-2 transition-colors">
                Login
              </button>
            </Link>
            <Link href="/register">
              <Button className="bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
            <Zap className="h-4 w-4 text-cyan-500" />
            <span className="text-cyan-500 text-sm font-medium">Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build Intelligent
            <br />
            <span className="text-cyan-500">AI Chatbots</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Create, train, and deploy AI chatbots powered by your own knowledge base. 
            Embed them anywhere with a single line of code.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-cyan-500 text-[#030617] hover:bg-cyan-400 font-semibold px-8 py-6 text-lg glow-cyan">
                Start Building Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg">
                See Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Everything You Need to Build <span className="text-cyan-500">Smart Bots</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Bot className="h-10 w-10" />}
              title="Custom Training"
              description="Upload PDFs, documents, or text files. Your bot learns from your unique knowledge base."
            />
            <FeatureCard
              icon={<Code className="h-10 w-10" />}
              title="Easy Embedding"
              description="Add your chatbot to any website with a single script tag. No coding required."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Secure API"
              description="Protected endpoints with API keys. Full control over who accesses your bots."
            />
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-20 px-6 bg-[#0a0f1a]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Embed in <span className="text-cyan-500">Seconds</span>
          </h2>
          <p className="text-gray-400 text-center mb-10">
            Just add this snippet to your website
          </p>
          
          <div className="max-w-2xl mx-auto bg-[#030617] rounded-lg border border-white/10 p-6 overflow-x-auto">
            <pre className="text-sm">
              <code className="text-gray-300">
                <span className="text-cyan-500">&lt;script</span>
                {'\n'}  <span className="text-purple-400">src</span>=<span className="text-green-400">"https://cdn.univerbot.app/univerbot.js"</span>
                {'\n'}  <span className="text-purple-400">data-bot-id</span>=<span className="text-green-400">"YOUR_BOT_ID"</span>
                {'\n'}<span className="text-cyan-500">&gt;&lt;/script&gt;</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-cyan-500" />
            <span className="text-lg font-bold text-white">UniverBot</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 UniverBot. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[#0a0f1a] border border-white/10 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300">
      <div className="text-cyan-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
