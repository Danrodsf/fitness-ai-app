import { ChatMessage, ProposedChange } from '@/shared/services/AICoachService'

export interface ChatState {
  messages: ChatMessage[]
  pendingProposal: ProposedChange | null
  isOpen: boolean
  isLoading: boolean
  isWaitingConfirmation: boolean
  error: string | null
}

export type ChatAction =
  | { type: 'CHAT_TOGGLE' }
  | { type: 'CHAT_OPEN' }
  | { type: 'CHAT_CLOSE' }
  | { type: 'CHAT_ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CHAT_SET_LOADING'; payload: boolean }
  | { type: 'CHAT_SET_PENDING_PROPOSAL'; payload: ProposedChange }
  | { type: 'CHAT_CLEAR_PENDING_PROPOSAL' }
  | { type: 'CHAT_SET_ERROR'; payload: string }
  | { type: 'CHAT_CLEAR_ERROR' }
  | { type: 'CHAT_CLEAR_HISTORY' }

const initialState: ChatState = {
  messages: [],
  pendingProposal: null,
  isOpen: false,
  isLoading: false,
  isWaitingConfirmation: false,
  error: null
}

export function chatReducer(state: ChatState = initialState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'CHAT_TOGGLE':
      return {
        ...state,
        isOpen: !state.isOpen,
        error: null
      }
      
    case 'CHAT_OPEN':
      return {
        ...state,
        isOpen: true,
        error: null
      }
      
    case 'CHAT_CLOSE':
      return {
        ...state,
        isOpen: false,
        error: null
      }
      
    case 'CHAT_ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null
      }
      
    case 'CHAT_SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      }
      
    case 'CHAT_SET_PENDING_PROPOSAL':
      return {
        ...state,
        pendingProposal: action.payload,
        isWaitingConfirmation: true,
        isLoading: false
      }
      
    case 'CHAT_CLEAR_PENDING_PROPOSAL':
      return {
        ...state,
        pendingProposal: null,
        isWaitingConfirmation: false
      }
      
    case 'CHAT_SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
      
    case 'CHAT_CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
      
    case 'CHAT_CLEAR_HISTORY':
      return {
        ...state,
        messages: [],
        pendingProposal: null,
        isWaitingConfirmation: false,
        error: null
      }
      
    default:
      return state
  }
}