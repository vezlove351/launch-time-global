'use client'

import { useState, useEffect } from 'react'
import { ethers, BrowserProvider } from 'ethers'
import { TokenGrid }  from "@/components/token-grid"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { Sparkles, Flame, TrendingUp, Wallet } from 'lucide-react'
import { factoryAbi } from '@/utils/abis/factoryAbi'
import { useToast } from "@/hooks/use-toast"

// Assuming this is the Token interface from your token-grid
interface Token {
  name: string;
  symbol: string;
  description: string;
  tokenImageUrl: string;
  fundingRaised: string;
  tokenAddress: string;
  creatorAddress: string;
  createdAt: number;
}

interface RawMemeToken {
  name: string;
  symbol: string;
  description: string;
  tokenImageUrl: string;
  fundingRaised: bigint;
  tokenAddress: string;
  creatorAddress: string;
  createdAt: number;
}

type FilterType = 'all' | 'new' | 'popular' | 'myTokens'

function useAddress() {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    async function getAddress() {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum)
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

export default function ExplorePage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('new')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const address = useAddress()

  useEffect(() => {
    const fetchMemeTokens = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL)
        const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT

        if (!contractAddress) {
          throw new Error('Contract address is not defined')
        }

        const contract = new ethers.Contract(contractAddress, factoryAbi, provider)
        
        const memeTokens = await contract.getAllMemeTokens()

        const formattedTokens: Token[] = memeTokens.map((token: RawMemeToken) => ({
          name: token.name,
          symbol: token.symbol,
          tokenImageUrl: token.tokenImageUrl || "/placeholder.svg",
          creatorAddress: token.creatorAddress,
          description: token.description,
          fundingRaised: ethers.formatEther(token.fundingRaised),
          tokenAddress: token.tokenAddress,
          createdAt: token.createdAt,
        }))

        setTokens(formattedTokens)
        setFilteredTokens(formattedTokens)
      } catch (error: unknown) {
        console.error('Error fetching meme tokens:', error)
        let errorMessage = 'Failed to fetch meme tokens. Please try again.'
        if (error instanceof Error) {
          errorMessage += ` Error: ${error.message}`
        }
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemeTokens()
  }, [toast])

  useEffect(() => {
    let filtered = tokens

    switch (activeFilter) {
      case 'new':
        filtered = [...tokens].sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'popular':
        filtered = [...tokens].sort((a, b) => parseFloat(b.fundingRaised) - parseFloat(a.fundingRaised))
        break
      case 'myTokens':
        if (address) {
          filtered = tokens.filter((token) => 
            token.creatorAddress.toLowerCase() === address.toLowerCase()
          )
        }
        break
      // 'all' case is not needed as it's the default state of 'filtered'
    }

    filtered = filtered.filter(token => {
      const matchesSearch = 
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.description.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    setFilteredTokens(filtered)
  }, [searchTerm, tokens, activeFilter, address])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col">
      <Header>
        {({ selectedNetwork }) => null}
      </Header>
      <main className="flex-grow container px-4 mx-auto max-w-6xl py-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">Community tokens</h1>
          <div className="flex space-x-2">
            <FilterButton
              icon={<Sparkles size={16} />}
              label="New"
              isActive={activeFilter === 'new'}
              onClick={() => setActiveFilter(prevFilter => prevFilter === 'new' ? 'all' : 'new')}
            />
            <FilterButton
              icon={<Flame size={16} />}
              label="Popular"
              isActive={activeFilter === 'popular'}
              onClick={() => setActiveFilter(prevFilter => prevFilter === 'popular' ? 'all' : 'popular')}
            />
            <FilterButton
              icon={<Wallet size={16} />}
              label="My Tokens"
              isActive={activeFilter === 'myTokens'}
              onClick={() => setActiveFilter(prevFilter => prevFilter === 'myTokens' ? 'all' : 'myTokens')}
            />
          </div>
        </div>
        <div className="mb-8">
          <SearchInput value={searchTerm} onChange={setSearchTerm} />
        </div>
        {isLoading ? (
          <p className="text-white text-center">Loading tokens...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : filteredTokens.length > 0 ? (
          <TokenGrid tokens={filteredTokens} />
        ) : (
          <p className="text-white text-center">No tokens found matching your search and filter criteria.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}

interface FilterButtonProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

function FilterButton({ icon, label, isActive, onClick }: FilterButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "secondary"}
      size="sm"
      className={`flex items-center space-x-1 ${isActive ? 'bg-[#4F46E5]' : 'bg-gray-700'}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  )
}

