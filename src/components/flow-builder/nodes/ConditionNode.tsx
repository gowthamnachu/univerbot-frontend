'use client'

import { memo, useState } from 'react'
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow'
import { GitBranch, Check, X, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ConditionNodeData {
  label: string
  variable: string
  condition: string
}

const ConditionNode = memo(({ data, id, selected }: NodeProps<ConditionNodeData>) => {
  const { setNodes } = useReactFlow()
  
  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              condition: e.target.value,
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
      <div className={`absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      
      {/* Main node */}
      <div className={`relative min-w-[280px] bg-[#0f172a] rounded-2xl shadow-2xl border ${selected ? 'border-orange-400' : 'border-slate-700/50'} overflow-hidden transition-all duration-200`}>
        <Handle
          type="target"
          position={Position.Left}
          className="!w-4 !h-4 !bg-slate-600 !border-2 !border-slate-400 !left-[-8px] hover:!bg-orange-500 transition-colors"
        />
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-orange-600/20 to-amber-500/10 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <GitBranch className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">{data.label || 'Condition'}</span>
              <p className="text-xs text-slate-400">Branch based on logic</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              <span>If condition is met</span>
            </div>
            <Input
              defaultValue={data.condition || ''}
              onChange={handleConditionChange}
              placeholder="e.g., user_input contains 'help'"
              className="h-10 bg-slate-800/50 border-slate-600/50 text-slate-200 placeholder:text-slate-500 focus:border-orange-400/50 focus:ring-orange-400/20 rounded-lg text-sm"
            />
          </div>
          
          {/* Output indicators */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">True</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <X className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-xs text-rose-300 font-medium">False</span>
            </div>
          </div>
        </div>
        
        {/* True output handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          style={{ top: '45%' }}
          className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-emerald-300 !right-[-8px]"
        />
        {/* False output handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          style={{ top: '75%' }}
          className="!w-4 !h-4 !bg-rose-500 !border-2 !border-rose-300 !right-[-8px]"
        />
      </div>
    </div>
  )
})

ConditionNode.displayName = 'ConditionNode'
export default ConditionNode
