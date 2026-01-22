'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  ConnectionLineType,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'

import StartNode from './nodes/StartNode'
import MessageNode from './nodes/MessageNode'
import ChatInputNode from './nodes/ChatInputNode'
import AIResponseNode from './nodes/AIResponseNode'
import ConditionNode from './nodes/ConditionNode'
import NodePanel from './NodePanel'
import { Button } from '@/components/ui/button'
import { Save, Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react'

// Define nodeTypes outside the component to prevent re-renders
const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  chatInput: ChatInputNode,
  aiResponse: AIResponseNode,
  condition: ConditionNode,
}

interface FlowBuilderProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onSave?: (nodes: Node[], edges: Edge[]) => void
  botName?: string
}

const defaultNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 100, y: 200 },
    data: { label: 'Start' },
  },
  {
    id: 'welcome-1',
    type: 'message',
    position: { x: 350, y: 150 },
    data: {
      label: 'Welcome',
      message: "I'm an AI chatbot that can answer all your questions.\n\nWelcome to UniverBot.",
    },
  },
  {
    id: 'chat-1',
    type: 'chatInput',
    position: { x: 700, y: 280 },
    data: {
      label: 'Chat',
      variableName: 'user_message',
    },
  },
  {
    id: 'ai-1',
    type: 'aiResponse',
    position: { x: 1000, y: 200 },
    data: {
      label: 'Generate AI Answer',
      inputVariable: 'user_question',
      useKnowledgeBase: true,
    },
  },
]

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: 'start-1', target: 'welcome-1', animated: true },
  { id: 'e2-3', source: 'welcome-1', target: 'chat-1' },
  { id: 'e3-4', source: 'chat-1', target: 'ai-1' },
  { id: 'e4-3', source: 'ai-1', target: 'chat-1', style: { strokeDasharray: '5,5' } },
]

function FlowBuilderInner({ initialNodes, initialEdges, onSave, botName }: FlowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  // Use default nodes if initialNodes is undefined, null, or empty array
  const startNodes = (initialNodes && initialNodes.length > 0) ? initialNodes : defaultNodes
  const startEdges = (initialEdges && initialEdges.length > 0) ? initialEdges : defaultEdges
  
  // Log for debugging
  console.log('FlowBuilder initializing with:', {
    initialNodes: initialNodes?.length,
    initialEdges: initialEdges?.length,
    usingDefaults: !initialNodes || initialNodes.length === 0,
    startNodesCount: startNodes.length,
    startEdgesCount: startEdges.length
  })
  
  const [nodes, setNodes, onNodesChange] = useNodesState(startNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(startEdges)
  const reactFlowInstance2 = useReactFlow()

  // Fit view when instance is ready
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance)
    // Wait a bit for nodes to render then fit view
    setTimeout(() => {
      instance.fitView({ padding: 0.2 })
    }, 100)
  }, [])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: true,
        type: 'smoothstep',
        style: { stroke: '#00E5FF', strokeWidth: 2 }
      }, eds))
    },
    [setEdges]
  )

  const isValidConnection = useCallback((connection: Connection) => {
    // Prevent connecting a node to itself
    return connection.source !== connection.target
  }, [])

  // Handle node/edge deletion with Delete/Backspace key
  const onNodesDelete = useCallback((deleted: Node[]) => {
    console.log('Nodes deleted:', deleted)
  }, [])

  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    console.log('Edges deleted:', deleted)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type || !reactFlowWrapper.current) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance2.screenToFlowPosition
        ? reactFlowInstance2.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          })
        : reactFlowInstance2.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          })

      const nodeId = `${type}-${Date.now()}`
      let newNode: Node = {
        id: nodeId,
        type,
        position,
        data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
      }

      // Set default data based on node type
      switch (type) {
        case 'message':
          newNode.data = { label: 'Message', message: '' }
          break
        case 'chatInput':
          newNode.data = { label: 'Chat Input', variableName: 'user_message' }
          break
        case 'aiResponse':
          newNode.data = { label: 'AI Response', inputVariable: 'user_question', useKnowledgeBase: true }
          break
        case 'condition':
          newNode.data = { label: 'Condition', variable: '', condition: '' }
          break
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance2, setNodes]
  )

  const handleSave = () => {
    // Create deep copy to ensure all node data is captured
    const nodesWithData = nodes.map(node => ({
      ...node,
      data: { ...node.data }
    }))
    
    console.log('=== SAVING FLOW ===')
    console.log('Number of nodes:', nodesWithData.length)
    console.log('Number of edges:', edges.length)
    console.log('Nodes data:', JSON.stringify(nodesWithData, null, 2))
    console.log('Edges data:', JSON.stringify(edges, null, 2))
    console.log('==================')
    
    onSave?.(nodesWithData, edges)
  }

  return (
    <div className="w-full h-full flex bg-[#030617]" style={{ minHeight: '600px' }}>
      <NodePanel />
      
      <div ref={reactFlowWrapper} className="flex-1 h-full relative" style={{ minHeight: '600px' }}>
        {/* Decorative corner gradients */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none z-0" />
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          isValidConnection={isValidConnection}
          fitView
          fitViewOptions={{ padding: 0.3, includeHiddenNodes: false }}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode="Shift"
          selectionOnDrag
          selectNodesOnDrag={false}
          className="!bg-[#030617]"
          connectionLineStyle={{ stroke: '#00E5FF', strokeWidth: 3 }}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{ 
            type: 'smoothstep', 
            animated: true, 
            style: { stroke: '#00E5FF', strokeWidth: 2 } 
          }}
          snapToGrid={true}
          snapGrid={[15, 15]}
          connectionRadius={30}
          minZoom={0.3}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
          <Controls 
            showInteractive={false} 
            className="!bg-[#0a0f1a] !border-white/10 !rounded-xl !shadow-2xl [&>button]:!bg-[#0a0f1a] [&>button]:!border-white/10 [&>button]:!text-gray-400 [&>button:hover]:!bg-[#1e293b] [&>button:hover]:!text-white" 
          />
          
          <Panel position="top-right" className="flex gap-3">
            <Button
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium border-0 px-5 py-2 rounded-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Flow
            </Button>
          </Panel>
          
          <Panel position="top-center" className="bg-[#0a0f1a]/95 backdrop-blur-xl px-6 py-3.5 rounded-xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-white">{botName || 'Untitled Bot'}</span>
              <span className="text-xs text-gray-500">• Draft</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}

export default function FlowBuilder(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner {...props} />
    </ReactFlowProvider>
  )
}
