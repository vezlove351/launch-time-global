'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { TokenGrid }  from "@/components/token-grid"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { Sparkles, Flame, TrendingUp, Wallet } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useReadContract } from "thirdweb/react"
import { getContractForChain, chains, ChainKey } from "@/app/client";
import { useTheme } from "@/context/ThemeContext"

interface Token {
  name: string;
  symbol: string;
  description: string;
  tokenImageUrl: string;
  fundingRaised: string;
  tokenAddress: string;
  creatorAddress: string;
}

type FilterType = 'all' | 'new' | 'popular' | 'myTokens'

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

export default function TestPage() {
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('new')
  const { toast } = useToast()
  const address = useAddress()
  const { theme } = useTheme()

  return (
    <Header>
      {({ selectedNetwork }) => {
        const chainKey = selectedNetwork.networkId.toLowerCase() as ChainKey;
        const contract = getContractForChain(chainKey);
        
        const { data: tokens, isLoading } = useReadContract({
          contract,
          method: "function getAllMemeTokens() view returns ((string name, string symbol, string description, string tokenImageUrl, uint256 fundingRaised, address tokenAddress, address creatorAddress)[])",
          params: [],
        })

        useEffect(() => {
          if (!tokens) return

          let filtered = tokens.map((token: any) => ({
            name: token.name,
            symbol: token.symbol,
            description: token.description,
            tokenImageUrl: token.tokenImageUrl || "/placeholder.svg",
            fundingRaised: ethers.formatEther(token.fundingRaised.toString()),
            tokenAddress: token.tokenAddress,
            creatorAddress: token.creatorAddress,
          }))

          filtered = filtered.filter(token => {
            const matchesSearch = 
              token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
              token.description.toLowerCase().includes(searchTerm.toLowerCase())

            return matchesSearch
          })

          switch (activeFilter) {
            case 'new':
              // Assuming newer tokens are at the end of the array
              filtered = [...filtered].reverse()
              break
            case 'popular':
              filtered = [...filtered].sort((a, b) => parseFloat(b.fundingRaised) - parseFloat(a.fundingRaised))
              break
            case 'myTokens':
              if (address) {
                filtered = filtered.filter((token) => 
                  token.creatorAddress.toLowerCase() === address.toLowerCase()
                )
              }
              break
          }

          setFilteredTokens(filtered)
        }, [tokens, searchTerm, activeFilter, address, selectedNetwork])

        const handleFilterClick = (filter: FilterType) => {
          if (filter === 'myTokens' && !address) {
            toast({
              title: "Wallet Not Connected",
              description: "Please connect your wallet to view your tokens.",
              variant: "destructive",
            })
            return
          }
          setActiveFilter(prevFilter => prevFilter === filter ? 'all' : filter)
        }

        return (
          <>
            <div className={`min-h-screen flex flex-col ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-[#2A2F4E] to-[#1A2435]'
              : 'bg-gradient-to-br from-[#FFFFFF] to-[#F0F2F5]'
            }`}>
            <main className="flex-grow container px-4 mx-auto max-w-6xl py-16 text-gray-900 dark:white">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-4xl font-bold mb-4 md:mb-0 text-gray-900 dark:text-white">Community tokens on {selectedNetwork.name}</h1>
                <div className="flex space-x-2 items-center">
                  <FilterButton
                    icon={<Sparkles size={16} />}
                    label="New"
                    isActive={activeFilter === 'new'}
                    onClick={() => handleFilterClick('new')}
                  />
                  <FilterButton
                    icon={<Flame size={16} />}
                    label="Popular"
                    isActive={activeFilter === 'popular'}
                    onClick={() => handleFilterClick('popular')}
                  />
                  <div className="h-6 w-px bg-gray-600 mx-2" />
                  <FilterButton
                    icon={<Wallet size={16} />}
                    label="My Tokens"
                    isActive={activeFilter === 'myTokens'}
                    onClick={() => handleFilterClick('myTokens')}
                  />
                </div>
              </div>
              
              <div className="mb-8">
                <SearchInput value={searchTerm} onChange={setSearchTerm} />
              </div>
              {isLoading ? (
                <p className="text-center text-gray-600 dark:text-gray-300">Loading tokens...</p>
              ) : filteredTokens.length > 0 ? (
                <TokenGrid tokens={filteredTokens} />
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-300">No tokens found for {selectedNetwork.name} network.</p>
              )}
            </main>
            </div>
            <Footer />
          </>
        )
      }}
    </Header>
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
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  )
}

