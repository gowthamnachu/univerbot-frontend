'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Play, Zap } from 'lucide-react'

const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`group relative transition-all duration-300 ${selected ? 'scale-105' : ''}`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-emerald-500/30 rounded-2xl blur-xl transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      
      {/* Main node */}
      <div className={`relative px-6 py-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl border-2 ${selected ? 'border-emerald-300' : 'border-emerald-400/50'} flex items-center gap-3 min-w-[140px]`}>
        {/* Animated pulse ring */}
        <div className="absolute inset-0 rounded-2xl animate-ping bg-emerald-400/20" style={{ animationDuration: '2s' }} />
        
        <div className="relative flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-wide">START</span>
            <p className="text-emerald-100/70 text-xs">Entry point</p>
          </div>
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          className="!w-4 !h-4 !bg-white !border-2 !border-emerald-300 !right-[-8px] shadow-lg"
        />
      </div>
    </div>
  )
})

StartNode.displayName = 'StartNode'
export default StartNode
