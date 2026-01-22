import StartNode from './StartNode'
import MessageNode from './MessageNode'
import ChatInputNode from './ChatInputNode'
import AIResponseNode from './AIResponseNode'
import ConditionNode from './ConditionNode'

export const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  chatInput: ChatInputNode,
  aiResponse: AIResponseNode,
  condition: ConditionNode,
}

export { StartNode, MessageNode, ChatInputNode, AIResponseNode, ConditionNode }
