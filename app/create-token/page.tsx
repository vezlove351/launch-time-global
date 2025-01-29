'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import Link from 'next/link'
import TokenCreationForm from '@/components/token-create'
import { useTheme } from "@/context/ThemeContext"
import { chains } from '@/app/client'
import { useNetwork } from '@/context/network'

function useAddress() {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    async function getAddress() {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        try {
          const accounts = await provider.send('eth_requestAccounts', [])
          setAddress(accounts[0])
        } catch (error) {
          console.error('Error connecting to wallet:', error)
        }
      }
    }
    getAddress()
  }, [])

  return address
}

function getNetworkFees(networkId: string) {
  switch (networkId) {
    case 'avalanche':
      return { creationFee: '0.77 AVAX', fundingTarget: '770 AVAX' };
    case 'bsc':
      return { creationFee: '0.05 BNB', fundingTarget: '50 BNB' };
    default:
      return { creationFee: '0.01 ETH', fundingTarget: '10 ETH' };
  }
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
  const { theme } = useTheme()
  const { chain } = useNetwork()
  const { creationFee, fundingTarget } = getNetworkFees(chain);

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

  const selectedNetwork = {
    name: chains[chain].name,
    id: chains[chain].id.toString(),
    networkId: chain,
  }

  return (
    <Header>
      {({ selectedNetwork }) => (
        <div className={`min-h-screen flex flex-col ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-[#2A2F4E] to-[#1A2435]'
            : 'bg-gradient-to-br from-[#FFFFFF] to-[#F0F2F5]'
        }`}>
          <main className="flex-grow container px-4 mx-auto max-w-7xl py-16">
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-8`}>
              Create Your Meme Token on {selectedNetwork.name}
            </h1>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left side - Form and Info */}
              <div className="w-full lg:w-2/3 space-y-6">
                <Card className={`${theme === 'dark' ? 'bg-gray-800/50 border-white' : 'bg-gray-200 border-gray-600'} p-6 border` }>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>MemeCoin creation fee: {creationFee}</li>
                    <li>Max supply: 1M tokens</li>
                    <li>Initial mint: 200K tokens</li>
                    <li>If funding target of {fundingTarget} is met, a liquidity pool will be created on <Link href="https://app.uniswap.org/" target='_blank' className='underline'>Uniswap</Link>.</li>
                  </ul>
                </Card>
               <Card className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} border-none rounded-2xl p-6`}>
                  <TokenCreationForm 
                    onTokenCreated={handleTokenCreation} 
                    onFormChange={handleFormChange}
                    initialTokenDetails={tokenDetails}
                    selectedNetwork={selectedNetwork}
                    creationFee={creationFee}
                    fundingTarget={fundingTarget}
                  />
                </Card>
              </div>
              {/* Right side - Token Preview */}
              <div className="w-full lg:w-1/3">
                <Card className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} p-6 border-0`}>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Token Preview</h2>
                  <div className="space-y-4">
                    <div className={`w-full aspect-square ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg overflow-hidden`}>
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
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tokenDetails.name || "Token Name"}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{tokenDetails.symbol || "SYMBOL"}</p>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{tokenDetails.description || "Token description will appear here."}</p>
                    <div className="space-y-2">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Token Address: <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Not yet created</span>
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Creator Address: <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      )}
    </Header>
  )
}
