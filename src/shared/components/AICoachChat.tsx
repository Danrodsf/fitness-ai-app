import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, CheckCircle, XCircle, Loader2, Brain, Zap, User, Bot } from 'lucide-react'
import { useAICoach } from '@/shared/hooks/useAICoach'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'

interface AICoachChatProps {
  className?: string
}

export const AICoachChat: React.FC<AICoachChatProps> = ({ className = '' }) => {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    chat,
    sendMessage,
    applyProposalChanges,
    rejectProposal,
    toggleChat,
    clearError,
    isConfigured
  } = useAICoach()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat.messages])

  useEffect(() => {
    if (chat.isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chat.isOpen])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chat.isLoading) return
    
    const message = inputMessage.trim()
    setInputMessage('')
    
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleConfirmProposal = async (proposalId: string) => {
    await applyProposalChanges(proposalId)
  }

  const handleRejectProposal = () => {
    rejectProposal()
  }

  if (!chat.isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={toggleChat}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="sm"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
        {!isConfigured && (
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-96 h-[500px] flex flex-col shadow-2xl border-0 bg-white dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            <h3 className="font-semibold">AI Coach</h3>
            {chat.isLoading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </div>
          <Button
            onClick={toggleChat}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chat.messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Brain className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <p className="text-sm">
                {!isConfigured ? (
                  <>
                    Configura las credenciales de IA en las variables de entorno
                    <br />
                    <span className="text-xs text-gray-400 mt-2 block">
                      Necesitas VITE_AI_API_KEY en tu archivo .env
                    </span>
                  </>
                ) : (
                  <>
                    ¡Hola! Soy tu entrenador personal AI. 
                    <br />
                    ¿En qué puedo ayudarte hoy?
                  </>
                )}
              </p>
            </div>
          )}

          {chat.messages.map((message) => (
            <div key={message.id}>
              <div className={`flex gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`flex items-start gap-2 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className={`px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mt-1 text-center">
                {message.timestamp.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))}

          {chat.isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Proposal Confirmation */}
        {chat.pendingProposal && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                    {chat.pendingProposal.title}
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    {chat.pendingProposal.description}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Razón:</strong> {chat.pendingProposal.reasoning}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleConfirmProposal(chat.pendingProposal!.id)}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aplicar
                </Button>
                <Button
                  onClick={handleRejectProposal}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Mantener actual
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {chat.error && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-300">{chat.error}</p>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="ml-auto p-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !isConfigured 
                  ? "IA no configurada..." 
                  : "Pregúntame sobre tu entrenamiento..."
              }
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={chat.isLoading || chat.isWaitingConfirmation || !isConfigured}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chat.isLoading || chat.isWaitingConfirmation || !isConfigured}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}