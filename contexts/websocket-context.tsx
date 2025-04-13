"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import useWebSocket, { type ReadyState } from "react-use-websocket"
import type { WebSocketMessage } from "@/lib/websocket-types"
import type { User } from "@/lib/mock-data"

interface WebSocketContextType {
  sendMessage: (conversationId: string, content: string, attachments?: any[]) => void
  sendTypingStart: (conversationId: string) => void
  sendTypingEnd: (conversationId: string) => void
  addReaction: (messageId: string, conversationId: string, emoji: string) => void
  removeReaction: (messageId: string, conversationId: string, emoji: string) => void
  sendReadReceipt: (conversationId: string, messageId: string) => void
  connectionStatus: ReadyState
  lastMessage: WebSocketMessage | null
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider")
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
  user: User
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, user }) => {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  // In a real app, you would get this from an environment variable
  const socketUrl = `ws://localhost:8080/ws?userId=${user.id}`

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log("WebSocket connection established"),
    onClose: () => console.log("WebSocket connection closed"),
    onError: (event) => console.error("WebSocket error:", event),
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  })

  useEffect(() => {
    if (lastJsonMessage) {
      setLastMessage(lastJsonMessage as WebSocketMessage)
    }
  }, [lastJsonMessage])

  const sendMessage = useCallback(
    (conversationId: string, content: string, attachments: any[] = []) => {
      sendJsonMessage({
        event: "message",
        payload: {
          conversationId,
          content,
          attachments,
          senderId: user.id,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      })
    },
    [sendJsonMessage, user.id],
  )

  const sendTypingStart = useCallback(
    (conversationId: string) => {
      sendJsonMessage({
        event: "typing_start",
        payload: {
          conversationId,
          userId: user.id,
        },
        timestamp: Date.now(),
      })
    },
    [sendJsonMessage, user.id],
  )

  const sendTypingEnd = useCallback(
    (conversationId: string) => {
      sendJsonMessage({
        event: "typing_end",
        payload: {
          conversationId,
          userId: user.id,
        },
        timestamp: Date.now(),
      })
    },
    [sendJsonMessage, user.id],
  )

  const addReaction = useCallback(
    (messageId: string, conversationId: string, emoji: string) => {
      sendJsonMessage({
        event: "reaction_add",
        payload: {
          messageId,
          conversationId,
          userId: user.id,
          emoji,
        },
        timestamp: Date.now(),
      })
    },
    [sendJsonMessage, user.id],
  )

  const removeReaction = useCallback(
    (messageId: string, conversationId: string, emoji: string) => {
      sendJsonMessage({
        event: "reaction_remove",
        payload: {
          messageId,
          conversationId,
          userId: user.id,
          emoji,
        },
        timestamp: Date.now(),
      })
    },
    [sendJsonMessage, user.id],
  )

  const sendReadReceipt = useCallback(
    (conversationId: string, messageId: string) => {
      sendJsonMessage({
        event: "read_receipt",
        payload: {
          conversationId,
          userId: user.id,
          lastReadMessageId: messageId,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      })
    },
    [sendJsonMessage, user.id],
  )

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        sendTypingStart,
        sendTypingEnd,
        addReaction,
        removeReaction,
        sendReadReceipt,
        connectionStatus: readyState,
        lastMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
