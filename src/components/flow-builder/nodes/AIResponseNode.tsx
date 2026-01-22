'use client'

import { memo, useState } from 'react'
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow'
import { Sparkles, Database, Cpu, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AIResponseNodeData {
  label: string
  inputVariable: string
  useKnowledgeBase: boolean
  prompt?: string
  onDataChange?: (data: Partial<AIResponseNodeData>) => void
}

const AIResponseNode = memo(({ data, id, selected }: NodeProps<AIResponseNodeData>) => {
  const { setNodes } = useReactFlow()
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              inputVariable: e.target.value,
            },
          }
        }
        return node
      })
    )
  }

  return (
    <div className={`group relative transition-all duration-300 ${selected ? 'scale-[1.02]' : ''}`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      
      {/* Main node */}
      <div className={`relative min-w-[300px] bg-[#0f172a] rounded-2xl shadow-2xl border ${selected ? 'border-purple-400' : 'border-slate-700/50'} overflow-hidden transition-all duration-200`}>
        <Handle
          type="target"
          position={Position.Left}
          className="!w-4 !h-4 !bg-slate-600 !border-2 !border-slate-400 !left-[-8px] hover:!bg-purple-500 transition-colors"
        />
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-600/20 to-violet-500/10 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">{data.label || 'AI Response'}</span>
              <p className="text-xs text-slate-400">Generate intelligent answer</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* AI Processing indicator */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-violet-500/5 rounded-xl border border-purple-500/20">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-300">AI-Powered Response</span>
            <Zap className="h-3 w-3 text-yellow-400 ml-auto" />
          </div>
          
          {/* Input variable */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Read input from</span>
            </div>
            <Input
              defaultValue={data.inputVariable || 'user_question'}
              onChange={handleInputChange}
              className="h-10 bg-amber-500/10 border-amber-500/30 text-amber-300 font-mono text-sm focus:border-amber-400/50 focus:ring-amber-400/20 rounded-lg"
              placeholder="variable_name"
            />
          </div>
          
          {/* Knowledge base indicator */}
          <div className="flex items-center gap-3 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Database className="h-4 w-4 text-cyan-400" />
            <div className="flex-1">
              <span className="text-sm text-cyan-300">Knowledge Base</span>
              <p className="text-xs text-slate-500">Uses trained documents for context</p>
            </div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          className="!w-4 !h-4 !bg-slate-600 !border-2 !border-slate-400 !right-[-8px] hover:!bg-purple-500 transition-colors"
        />
      </div>
    </div>
  )
})

AIResponseNode.displayName = 'AIResponseNode'
export default AIResponseNode
