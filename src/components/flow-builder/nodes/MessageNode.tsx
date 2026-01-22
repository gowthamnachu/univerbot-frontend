'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow'
import { MessageSquare, Type } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface MessageNodeData {
  label: string
  message: string
}

const MessageNode = memo(({ data, id, selected }: NodeProps<MessageNodeData>) => {
  const { setNodes } = useReactFlow()
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              message: e.target.value,
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
      <div className={`absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      
      {/* Main node */}
      <div className={`relative min-w-[300px] bg-[#0f172a] rounded-2xl shadow-2xl border ${selected ? 'border-blue-400' : 'border-slate-700/50'} overflow-hidden transition-all duration-200`}>
        <Handle
          type="target"
          position={Position.Left}
          className="!w-4 !h-4 !bg-slate-600 !border-2 !border-slate-400 !left-[-8px] hover:!bg-blue-500 transition-colors"
        />
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">{data.label || 'Message'}</span>
              <p className="text-xs text-slate-400">Send a message</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Type className="h-3 w-3" />
            <span>Text Content</span>
          </div>
          <Textarea
            defaultValue={data.message || ''}
            onChange={handleChange}
            placeholder="Enter your message here..."
            className="min-h-[80px] text-sm bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none rounded-xl"
          />
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          className="!w-4 !h-4 !bg-slate-600 !border-2 !border-slate-400 !right-[-8px] hover:!bg-blue-500 transition-colors"
        />
      </div>
    </div>
  )
})

MessageNode.displayName = 'MessageNode'
export default MessageNode
