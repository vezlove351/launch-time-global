'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from 'lucide-react'

interface ChatComponentProps {
  nftName: string;
}

export function ChatComponent({ nftName }: ChatComponentProps) {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{sender: string, content: string}[]>([])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      setChatHistory([...chatHistory, { sender: 'You', content: message }])
      // Simulate AI response
      setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: nftName, content: "Thank you for your message. I'm here to help promote your token effectively!" }])
      }, 1000)
      setMessage('')
    }
  }

  return (
    <>
      <div className="flex-grow overflow-y-auto mb-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 p-2 rounded-lg ${msg.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="text-sm font-semibold">{msg.sender}</p>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-grow bg-gray-700 text-white border-gray-600"
        />
        <Button type="submit" className="bg-[#4F46E5] hover:bg-[#4F46E5]/90">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </>
  )
}

