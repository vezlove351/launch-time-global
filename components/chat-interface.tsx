import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { createSession, handleUserMessage, queryContract, getSessionHistory } from "@/scripts/Nebula.mjs"

interface Message {
  content: string
  sender: "user" | "bot"
}

interface ChatInterfaceProps {
  tokenAddress: string
  chainId: string
  isCreator: boolean
  onUserRequestCountChange: (count: number) => void
  hideHumanMessages: boolean
}

export function ChatInterface({
  tokenAddress,
  chainId,
  isCreator,
  onUserRequestCountChange,
  hideHumanMessages,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [userRequestCount, setUserRequestCount] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const updateUserRequestCount = useCallback(
    (count: number) => {
      setUserRequestCount(count)
      onUserRequestCountChange(count)
    },
    [onUserRequestCountChange],
  )

  useEffect(() => {
    async function initializeOrResumeChat() {
      try {
        const chatKey = `chat_session_${tokenAddress}_${chainId}`
        let existingSessionId = localStorage.getItem(chatKey)

        if (!existingSessionId) {
          existingSessionId = await createSession(`Token Chat - ${tokenAddress}`, tokenAddress, chainId)
          if (existingSessionId) {
            localStorage.setItem(chatKey, existingSessionId)
          }
        }

        setSessionId(existingSessionId)
        setIsTyping(true)

        const history = await getSessionHistory(existingSessionId)
        if (history && history.length > 0) {
          const formattedHistory = history.map((msg: { content: string; role: "user" | "assistant" }) => ({
            content: msg.content,
            sender: msg.role === "user" ? "user" : "bot",
          }))
          setMessages(formattedHistory)
            const userMessageCount: number = formattedHistory.filter((msg: Message) => msg.sender === "user").length
          updateUserRequestCount(userMessageCount)
        } else {
          const initialQuery = await queryContract(tokenAddress, chainId, existingSessionId)
          setMessages([{ content: initialQuery, sender: "bot" }])
        }

        setIsTyping(false)
      } catch (error) {
        console.error("Error initializing or resuming chat:", error)
        setIsTyping(false)
      }
    }

    initializeOrResumeChat()
  }, [tokenAddress, chainId, updateUserRequestCount])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && sessionId) {
      setMessages((prevMessages) => [...prevMessages, { content: input, sender: "user" }])
      setInput("")
      setIsTyping(true)
      updateUserRequestCount(userRequestCount + 1)

      try {
        const response = await handleUserMessage(input, sessionId, chainId, tokenAddress)
        setMessages((prevMessages) => [...prevMessages, { content: response, sender: "bot" }])
      } catch (error) {
        console.error("Error sending message:", error)
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: "An error occurred while processing your request.", sender: "bot" },
        ])
      } finally {
        setIsTyping(false)
      }
    }
  }

  const filteredMessages = hideHumanMessages ? messages.filter((message) => message.sender === "bot") : messages

  return (
    <div className="flex flex-col h-[570px] bg-black text-green-400 font-mono rounded-lg overflow-hidden">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {filteredMessages.map((message, index) => (
            <div
              key={index}
              className={`${message.sender === "user" ? "text-cyan-400" : "text-green-400"} break-words`}
            >
              {message.sender === "user" ? "> " : "$ "}
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="inline break-words">{children}</p>,
                  pre: ({ children }) => <pre className="whitespace-pre-wrap break-words">{children}</pre>,
                  code: ({ children }) => <code className="break-words">{children}</code>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ))}
          {isTyping && (
            <div className="text-green-400">
              $ <span className="animate-pulse">Typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
         
        </div>
      </ScrollArea>
      {isCreator ? (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white">
          <div className="flex items-center">
            <span className="mr-2 text-white">{">"}</span>
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-black text-green-400 border-none focus:ring-0"
              placeholder="Type your message..."
            />
            <Button type="submit" variant="outline" className="ml-2 text-[#4F46E5] border-[#4F46E5] rounded-full">
              Send
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-green-400 text-center">This chat is read-only for non-creators.</div>
      )}
    </div>
  )
}

