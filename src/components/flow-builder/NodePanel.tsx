'use client'

import { Play, MessageSquare, MessageCircle, Sparkles, GitBranch, GripVertical, Layers, Info, Workflow } from 'lucide-react'

const nodeList = [
  {
    type: 'start',
    label: 'Start',
    icon: Play,
    gradient: 'from-emerald-500 to-emerald-600',
    bgGlow: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    description: 'Entry point of flow',
  },
  {
    type: 'message',
    label: 'Message',
    icon: MessageSquare,
    gradient: 'from-blue-500 to-blue-600',
    bgGlow: 'bg-blue-500',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    description: 'Send a message to user',
  },
  {
    type: 'chatInput',
    label: 'Chat Input',
    icon: MessageCircle,
    gradient: 'from-rose-500 to-rose-600',
    bgGlow: 'bg-rose-500',
    borderColor: 'border-rose-500/30 hover:border-rose-500/60',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
    description: 'Wait for user input',
  },
  {
    type: 'aiResponse',
    label: 'AI Response',
    icon: Sparkles,
    gradient: 'from-purple-500 to-purple-600',
    bgGlow: 'bg-purple-500',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    description: 'Generate AI answer',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    gradient: 'from-orange-500 to-orange-600',
    bgGlow: 'bg-orange-500',
    borderColor: 'border-orange-500/30 hover:border-orange-500/60',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    description: 'Branch based on logic',
  },
]

export default function NodePanel() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-72 bg-[#0a0f1a] border-r border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/20">
            <Workflow className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Flow Nodes</h3>
            <p className="text-xs text-gray-500">Drag nodes to canvas</p>
          </div>
        </div>
      </div>
      
      {/* Node List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Available Nodes</p>
        
        {nodeList.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            className={`group flex items-center gap-3 p-3 rounded-xl border bg-[#030617] ${node.borderColor} cursor-grab hover:bg-[#0a0f1a] active:scale-[0.98] active:cursor-grabbing transition-all duration-200`}
          >
            <div className={`flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br ${node.gradient}`}>
              <node.icon className="h-4 w-4 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">
                {node.label}
              </div>
              <div className="text-xs text-gray-500 truncate">{node.description}</div>
            </div>
            
            <GripVertical className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        ))}
      </div>
      
      {/* Tips Section */}
      <div className="p-4 border-t border-white/5 bg-[#030617]/50">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Tips</h4>
        </div>
        <ul className="text-xs text-gray-500 space-y-2.5">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-base leading-none">•</span>
            <span>Drag nodes and connect via handles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-base leading-none">•</span>
            <span>Click nodes to edit properties</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-base leading-none">•</span>
            <span>Press Delete to remove nodes</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
