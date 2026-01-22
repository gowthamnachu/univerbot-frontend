'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow'
import { MessageCircle, Variable, User } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ChatInputNodeData {
  label: string
  variableName: string
}

const ChatInputNode = memo(({ data, id, selected }: NodeProps<ChatInputNodeData>) => {
  const { setNodes } = useReactFlow()
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              variableName: e.target.value,
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
      <div className={`absolute inset-0 bg-rose-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      
      {/* Main node */}
      <div className={`relative min-w-[280px] bg-[#0f172a] rounded-2xl shadow-2xl border ${selected ? 'border-rose-400' : 'border-slate-700/50'} overflow-hidden transition-all duration-200`}>
        <Handle
          type="target"
          position={Position.Left}
          className="!w-4 !h-4 !bg-slate-600 !border-2 !border-slate-400 !left-[-8px] hover:!bg-rose-500 transition-colors"
        />
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-rose-600/20 to-rose-500/10 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <MessageCircle className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">{data.label || 'Chat Input'}</span>
              <p className="text-xs text-slate-400">Capture user response</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300">Waiting for user input...</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Variable className="h-3 w-3" />
              <span>Store response as</span>
            </div>
            <Input
              defaultValue={data.variableName || 'user_message'}
              onChange={handleChange}
              className="h-10 bg-amber-500/10 border-amber-500/30 text-amber-300 font-mono text-sm focus:border-amber-400/50 focus:ring-amber-400/20 rounded-lg"
              placeholder="variable_name"
            />
          </div>
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          className="!w-4 !h-4 !bg-slate-600 !border-2 !border-slate-400 !right-[-8px] hover:!bg-rose-500 transition-colors"
        />
      </div>
    </div>
  )
})

ChatInputNode.displayName = 'ChatInputNode'
export default ChatInputNode
