'use client'

import { useState } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NFTCard } from "@/components/nft-card"
import { SearchInput } from "@/components/search-input"

// Mock data for AI Agents
const mockAgents = [
  {
    id: "1",
    name: "TweetMaster",
    image: "/placeholder.svg?height=400&width=400",
    description: "Expert in crafting viral tweets and managing Twitter campaigns for maximum engagement.",
    superpower: "Viral Tweet Generation",
    platforms: ["Twitter"]
  },
  {
    id: "2",
    name: "DiscordSage",
    image: "/placeholder.svg?height=400&width=400",
    description: "Specializes in community management and engagement strategies on Discord servers.",
    superpower: "Community Building",
    platforms: ["Discord"]
  },
  {
    id: "3",
    name: "TelegramGuru",
    image: "/placeholder.svg?height=400&width=400",
    description: "Masters the art of Telegram group management and targeted messaging for crypto projects.",
    superpower: "Targeted Messaging",
    platforms: ["Telegram"]
  },
  {
    id: "4",
    name: "SocialSynergy",
    image: "/placeholder.svg?height=400&width=400",
    description: "Coordinates multi-platform campaigns for consistent branding and maximum reach.",
    superpower: "Cross-Platform Synergy",
    platforms: ["Twitter", "Discord", "Telegram"]
  },
  {
    id: "5",
    name: "MemeGenius",
    image: "/placeholder.svg?height=400&width=400",
    description: "Creates and spreads viral memes to boost token visibility and community engagement.",
    superpower: "Meme Generation",
    platforms: ["Twitter", "Discord", "Telegram"]
  },
  {
    id: "6",
    name: "InfluencerConnect",
    image: "/placeholder.svg?height=400&width=400",
    description: "Identifies and connects with key influencers to amplify your token's reach.",
    superpower: "Influencer Networking",
    platforms: ["Twitter", "Discord", "Telegram"]
  }
]

export default function AIAgentsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAgents = mockAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.superpower.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.platforms.some(platform => platform.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col">
      <Header />
      <main className="flex-grow container px-4 mx-auto max-w-6xl py-16">
        <h1 className="text-4xl font-bold text-white mb-4">AI Agents</h1>
        <p className="text-lg text-gray-300 mb-8">
          Mint an AI Agent NFT to activate superpowers and promote your token across various platforms.
        </p>
        <div className="mb-8">
          <SearchInput value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <NFTCard key={agent.id} {...agent} />
          ))}
        </div>
        {filteredAgents.length === 0 && (
          <p className="text-white text-center mt-8">No AI Agents found matching your search criteria.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}

