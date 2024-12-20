'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import TokenCreationForm from '@/components/token-create'

function useAddress() {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    async function getAddress() {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        try {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setAddress(address)
        } catch (error) {
          console.error('Error connecting to wallet:', error)
        }
      }
    }
    getAddress()
  }, [])

  return address
}

export default function CreateTokenPage() {
  const [tokenDetails, setTokenDetails] = useState({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
  })
  const address = useAddress()
  const { toast } = useToast()

  const handleTokenCreation = (newTokenDetails: typeof tokenDetails) => {
    setTokenDetails(newTokenDetails)
    toast({
      title: "Success",
      description: "Your meme token has been created!",
    })
  }

  const handleFormChange = (newTokenDetails: typeof tokenDetails) => {
    setTokenDetails(newTokenDetails)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col">
      <Header />
      <main className="flex-grow container px-4 mx-auto max-w-6xl py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Create Your Meme</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Form and Info */}
          <div className="w-full lg:w-2/3 space-y-6">
            <Card className="bg-gray-800/50 p-6">
              <ul className="space-y-2 text-gray-300">
                <li>MemeCoin creation fee: 0.01 ETH</li>
                <li>Max supply: 1M tokens</li>
                <li>Initial mint: 200K tokens</li>
                <li>If funding target of 24 ETH is met, a liquidity pool will be created on Uniswap.</li>
              </ul>
            </Card>
           <Card className="bg-gray-800/50 border-none rounded-2xl p-6">
              <TokenCreationForm 
                onTokenCreated={handleTokenCreation} 
                onFormChange={handleFormChange}
                initialTokenDetails={tokenDetails}
              />
            </Card>
          </div>
          {/* Right side - Token Preview */}
          <div className="w-full lg:w-1/3">
            <Card className="bg-gray-800/50 p-6 border-0">
              <h2 className="text-xl font-bold text-white mb-4">Token Preview</h2>
              <div className="space-y-4">
                <div className="w-full aspect-square bg-gray-700 rounded-lg overflow-hidden">
                  {tokenDetails.imageUrl ? (
                    <Image
                      src={tokenDetails.imageUrl}
                      alt={tokenDetails.name || "Token image"}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{tokenDetails.name || "Token Name"}</h3>
                  <p className="text-sm text-gray-400">{tokenDetails.symbol || "SYMBOL"}</p>
                </div>
                <p className="text-sm text-gray-300">{tokenDetails.description || "Token description will appear here."}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Token Address: <span className="text-white">Not yet created</span>
                  </p>
                  <p className="text-sm text-gray-400">
                  Creator Address: <span className="text-white">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

