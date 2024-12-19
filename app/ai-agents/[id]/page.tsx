'use client'

import { Metadata } from 'next'
import Image from "next/image"
import { useParams } from 'next/navigation'
import { Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChatComponent } from "@/components/chat-component"

// Mock data type definition
interface NFTDetails {
  id: string
  name: string
  image: string
  description: string
  superpower: string
  platforms: string[]
  stats: {
    engagementRate: string
    averageRetweets: number
    viralTweetsCreated: number
  }
  testimonials: Array<{
    id: number
    user: string
    content: string
    rating: number
  }>
}

// Mock data - same structure as the main page but with additional details
const nftDetails: Record<string, NFTDetails> = {
  "1": {
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
  },
  // Add more NFT details matching your main page NFTs
  "2": {
    id: "2",
    name: "DiscordSage",
    image: "/placeholder.svg?height=400&width=400",
    description: "Specializes in community management and engagement strategies on Discord servers.",
    superpower: "Community Building",
    platforms: ["Discord"],
    stats: {
      engagementRate: "7.8%",
      averageRetweets: 800,
      viralTweetsCreated: 35
    },
    testimonials: [
      { id: 1, user: "CommunityManager", content: "Discord engagement increased dramatically!", rating: 5 },
      { id: 2, user: "ProjectOwner", content: "Best community management we've ever had.", rating: 5 }
    ]
  }
}

// Define duration options
interface DurationOption {
  period: string
  price: number
}

const durationOptions: DurationOption[] = [
  { period: '1 Month', price: 0.1 },
  { period: '3 Months', price: 0.25 },
  { period: '1 Year', price: 0.8 }
]

export default function NFTDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''
  
  // Get NFT details from our mock data
  const nft = nftDetails[id]

  if (!nft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col">
        <Header />
        <main className="flex-grow container px-4 mx-auto max-w-6xl py-16">
          <div className="text-white text-center">NFT not found</div>
        </main>
        <Footer />
      </div>
    )
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
                  src={nft.image}
                  alt={`${nft.name} AI Agent`}
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{nft.name}</h1>
              <p className="text-gray-300 mb-4">{nft.description}</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-300">Superpower: <span className="text-white">{nft.superpower}</span></p>
              </div>
            </Card>
            
            <Card className="bg-gray-800/50 p-6 border-0">
              <div className="flex justify-between mb-4">
                {durationOptions.map((option) => (
                  <Button
                    key={option.period}
                    variant="outline"
                    className="flex-1 mx-1 h-8 bg-gray-700 text-white"
                  >
                    {option.period}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Mint NFT</span>
                <span className="text-xl font-bold text-white">{durationOptions[0].price} ETH</span>
              </div>
              <Button className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 mt-4">
                Mint for {durationOptions[0].period}
              </Button>
            </Card>
          </div>

          {/* Right column - Chat */}
          <div className="w-full lg:w-2/3">
            <Card className="bg-gray-800/50 p-6 border-0 h-full flex flex-col">
              <h2 className="text-xl font-bold text-white mb-4">Chat with {nft.name}</h2>
              <ChatComponent nftName={nft.name} />
            </Card>
          </div>
        </div>

        {/* Testimonials row */}
        <div className="w-full">
          <Card className="bg-gray-800/50 p-6 border-0">
            <h2 className="text-xl font-bold text-white mb-4">Testimonials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nft.testimonials.map((testimonial) => (
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