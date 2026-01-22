import type { Metadata } from 'next'
import { Inter, Ovo, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import QueryProvider from '@/components/providers/query-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const ovo = Ovo({ weight: '400', subsets: ['latin'], variable: '--font-ovo' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'UniverBot - AI Chatbot Builder',
  description: 'Create, train, and deploy AI chatbots with ease. Build intelligent bots powered by your own knowledge base.',
  keywords: ['chatbot', 'AI', 'bot builder', 'RAG', 'knowledge base'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${ovo.variable} ${jakarta.variable} font-sans bg-[#030617] min-h-screen antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
