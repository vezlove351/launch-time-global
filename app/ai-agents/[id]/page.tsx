'use client'

import { useState } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Send, Star } from 'lucide-react'

// Mock data for the NFT details
const nftDetails = {
  id: "1",
  name: "TweetMaster",
  image: "/placeholder.svg?height=400&width=400",
  description: "Expert in crafting viral tweets and managing Twitter campaigns for maximum engagement.",
  superpower: "Viral Tweet Generation",
  platforms: ["Twitter"],
  stats: {
    engagementRate: "8.5%",
    averageRetweets: 1200,
    viralTweetsCreated: 50
  },
  testimonials: [
    { id: 1, user: "CryptoEnthusiast", content: "TweetMaster helped our token go viral overnight!", rating: 5 },
    { id: 2, user: "BlockchainDev", content: "Incredible results! Our community grew 10x in a week.", rating: 5 },
    { id: 3, user: "TokenLauncher", content: "The viral tweet generation is pure magic. Highly recommended!", rating: 4 }
  ]
}

const durationOptions = [
  { period: '1 week', price: 0.001 },
  { period: '1 month', price: 0.01 },
  { period: '6 months', price: 0.1 }
]

export default function NFTDetailsPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{sender: string, content: string}[]>([])
  const [duration, setDuration] = useState(durationOptions[0])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      setChatHistory([...chatHistory, { sender: 'You', content: message }])
      // Simulate AI response
      setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: nftDetails.name, content: "Thank you for your message. I'm here to help promote your token effectively!" }])
      }, 1000)
      setMessage('')
    }
  }

  const handleMint = () => {
    console.log(`Minting NFT: ${nftDetails.name} for ${duration.period} at ${duration.price} ETH`)
    // Here you would implement the actual minting logic
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col">
      <Header />
      <main className="flex-grow container px-4 mx-auto max-w-6xl py-16">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left column - NFT Image and Details */}
          <div className="w-full lg:w-1/3 space-y-4">
            <Card className="bg-gray-800/50 p-6 border-0">
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src={nftDetails.image}
                  alt={`${nftDetails.name} AI Agent`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-xl"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{nftDetails.name}</h1>
              <p className="text-gray-300 mb-4">{nftDetails.description}</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-300">Superpower: <span className="text-white">{nftDetails.superpower}</span></p>
              </div>
            </Card>
            
            <Card className="bg-gray-800/50 p-6 border-0">
              
              <div className="flex justify-between mb-4">
                {durationOptions.map((option) => (
                  <Button
                    key={option.period}
                    onClick={() => setDuration(option)}
                    variant={duration.period === option.period ? "default" : "outline"}
                    className={`flex-1 mx-1 h-8 ${duration.period === option.period ? 'bg-[#4F46E5]' : 'bg-gray-700 text-white'}`}
                  >
                    {option.period}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Mint NFT</span>
                <span className="text-xl font-bold text-white">{duration.price} ETH</span>
              </div>
              <Button onClick={handleMint} className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 mt-4">
                Mint for {duration.period}
              </Button>
            </Card>
          </div>

          {/* Right column - Chat */}
          <div className="w-full lg:w-2/3">
            <Card className="bg-gray-800/50 p-6 border-0 h-full flex flex-col">
              <h2 className="text-xl font-bold text-white mb-4">Chat with {nftDetails.name}</h2>
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
            </Card>
          </div>
        </div>

        {/* Testimonials row */}
        <div className="w-full">
          <Card className="bg-gray-800/50 p-6 border-0">
            <h2 className="text-xl font-bold text-white mb-4">Testimonials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nftDetails.testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-white">{testimonial.user}</p>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{testimonial.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

