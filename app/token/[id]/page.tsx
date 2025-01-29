"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useParams, useSearchParams } from "next/navigation"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import { PriceChart } from "@/components/price-chart"
import { TokenCard } from "@/components/token-card"
import { TokenPurchaseForm }  from "@/components/token-purchase-form"
import { TabBar } from "@/components/tab-bar"
import { Owners } from "@/components/owners"
import { Transfers } from "@/components/transfers"
import { ChatInterface } from "@/components/chat-interface"

import { BondingCurveProgress } from "@/components/bonding-curve-progress"
import { TokensAvailableForSale } from "@/components/tokens-available-for-sale"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useToast } from "@/hooks/use-toast"
import { useReadContract } from "thirdweb/react"
import { getContractForChain, type ChainKey, chains } from "@/app/client"
import { useNetwork } from "@/context/network"

interface TokenDetails {
  name: string
  symbol: string
  description: string
  creatorAddress: string
  tokenAddress: string
  fundingRaised: string
  tokenImageUrl: string
  bondingCurveProgress: number
  bondingCurveMax: number
  tokensAvailable: number
  totalTokens: number
  totalSupply: string
}

interface Owner {
  owner_address: string
  percentage_relative_to_total_supply: string
}

interface Transfer {
  from_address: string
  to_address: string
  value_decimal: string
  transaction_hash: string
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return url.startsWith("http://") || url.startsWith("https://")
  } catch {
    return false
  }
}

// Constants
const fundingGoal = 1
const maxSupply = 800000

function useAddress() {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    async function getAddress() {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        try {
          const accounts = await provider.send("eth_requestAccounts", [])
          setAddress(accounts[0])
        } catch (error) {
          console.error("Error connecting to wallet:", error)
        }
      }
    }
    getAddress()
  }, [])

  return address
}

export default function TokenDetails() {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null)
  const [remainingTokens, setRemainingTokens] = useState(0)

  const [activeTab, setActiveTab] = useState("Overview")
  const [owners, setOwners] = useState<Owner[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const params = useParams()
  const searchParams = useSearchParams()

  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [totalSupply, setTotalSupply] = useState(0)
  const [currentPrice, setCurrentPrice] = useState<string | null>(null)
  const [isCreator, setIsCreator] = useState(false)
  const [isTokenOwner, setIsTokenOwner] = useState(false)
  const [userRequestCount, setUserRequestCount] = useState(0)
  const [hideHumanMessages, setHideHumanMessages] = useState(false)

  const { toast } = useToast()
  const { chain } = useNetwork()
  const address = useAddress()

  // Extract the address from params
  const tokenAddress = params?.id as string
  const network = (searchParams?.get("network") || "ethereum") as ChainKey

  const contract = getContractForChain(chain as ChainKey)

  const { data: tokenData, isLoading: isTokenDataLoading } = useReadContract({
    contract,
    method:
      "function addressToMemeTokenMapping(address) view returns (string name, string symbol, string description, string tokenImageUrl, uint256 fundingRaised, address tokenAddress, address creatorAddress)",
    params: [tokenAddress],
  })

  const { data: totalSupplyData, isLoading: isTotalSupplyLoading } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
    params: [],
  })

  const { data: costData, isLoading: isCostLoading } = useReadContract({
    contract,
    method: "function calculateCost(uint256 currentSupply, uint256 tokensToBuy) view returns (uint256)",
    params: [BigInt(totalSupplyData || 0), BigInt(1)],
  })

  useEffect(() => {
    if (tokenData && !isTokenDataLoading) {
      const totalSupplyFormatted = Number(totalSupplyData || "0")
      setTotalSupply(totalSupplyFormatted)

      const remainingTokensCalculated = maxSupply - totalSupplyFormatted
      setRemainingTokens(remainingTokensCalculated)

      setTokenDetails({
        name: tokenData[0],
        symbol: tokenData[1],
        description: tokenData[2],
        tokenImageUrl: isValidUrl(tokenData[3]) ? tokenData[3] : "/placeholder.svg",
        fundingRaised: ethers.formatEther(tokenData[4]),
        tokenAddress: tokenData[5],
        creatorAddress: tokenData[6],
        bondingCurveProgress: Number.parseFloat(ethers.formatEther(tokenData[4])),
        bondingCurveMax: fundingGoal,
        tokensAvailable: remainingTokensCalculated,
        totalTokens: maxSupply,
        totalSupply: totalSupplyFormatted.toString(),
      })

      setIsCreator(address?.toLowerCase() === tokenData[6].toLowerCase())
    }
  }, [tokenData, isTokenDataLoading, totalSupplyData, address, owners])

  useEffect(() => {
    if (costData && !isCostLoading) {
      setCurrentPrice(ethers.formatEther(costData))
    }
  }, [costData, isCostLoading])

  useEffect(() => {
    const fetchOwnersAndTransfers = async () => {
      try {
        const ownersResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/owners?chain=base%20sepolia&order=DESC`,
          {
            headers: {
              accept: "application/json",
              "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_API_KEY || "",
            },
          },
        )
        const ownersData = await ownersResponse.json()
        setOwners(ownersData.result || [])

        const transfersResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/transfers?chain=base%20sepolia&order=DESC`,
          {
            headers: {
              accept: "application/json",
              "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_API_KEY || "",
            },
          },
        )
        const transfersData = await transfersResponse.json()
        setTransfers(transfersData.result || [])
      } catch (error) {
        console.error("Error fetching owners and transfers:", error)
        toast({
          title: "Error",
          description: "Failed to fetch owners and transfers data.",
          variant: "destructive",
        })
      }
    }

    if (tokenAddress && chain) {
      fetchOwnersAndTransfers()
    }
  }, [tokenAddress, chain, toast])

  useEffect(() => {
    if (address && owners.length > 0) {
      setIsTokenOwner(owners.some((owner) => owner.owner_address.toLowerCase() === address.toLowerCase()))
    }
  }, [address, owners])

  if (!tokenAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col items-center justify-center">
        <p className="text-center text-red-500 text-xl">Invalid token address: Address not found in URL parameters</p>
      </div>
    )
  }

  if (!tokenDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col items-center justify-center">
        {isTokenDataLoading ? (
          <div className="text-center text-white text-xl">Loading token details...</div>
        ) : (
          <p className="text-center text-red-500 text-xl">Failed to load token details</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-100 dark:from-[#2A2F4E] dark:to-[#1A2435]">
      <Header>
        {() => {
          const chainId = chains[chain as ChainKey]?.id?.toString() || "1"

          return (
            <>
              <main className="flex-grow container px-4 mx-auto py-8">
                <div className="flex flex-col lg:flex-row gap-8 mb-1">
                  <div className="w-full lg:w-1/3 space-y-6">
                    <TokenCard token={tokenDetails} />
                    <TokenPurchaseForm
                      tokenSymbol={tokenDetails.symbol}
                      tokenAddress={tokenDetails.tokenAddress}
                      totalSupply={tokenDetails.totalSupply}
                      network={network}
                    />
                    <BondingCurveProgress
                      fundingRaised={tokenDetails.fundingRaised}
                      bondingCurveMax={tokenDetails.bondingCurveMax}
                      bondingCurveProgress={tokenDetails.bondingCurveProgress}
                    />
                  </div>

                  <div className="w-full lg:w-2/3 space-y-6">
                    <div className="flex justify-center lg:justify-start">
                      <TabBar
                        tabs={["Overview", "Terminal", "Holders", "Transfers"]}
                        onTabChange={setActiveTab}
                        userRequestCount={userRequestCount}
                        hideHumanMessages={hideHumanMessages}
                        onHideHumanMessagesChange={setHideHumanMessages}
                        isTokenOwner={isCreator || isTokenOwner} 
                      />
                    </div>

                    <div className="p-2">
                      <div className="h-[600px] overflow-hidden bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                        {activeTab === "Overview" && (
                          <ScrollArea className="h-full">
                            <div className="p-4">
                              <PriceChart />
                            </div>
                          </ScrollArea>
                        )}
                        {activeTab === "Terminal" && (
                          <div className="p-4">
                            <ChatInterface
                              tokenAddress={tokenAddress}
                              chainId={chainId}
                              isCreator={isCreator}
                              onUserRequestCountChange={setUserRequestCount}
                              hideHumanMessages={hideHumanMessages}
                            />
                          </div>
                        )}
                        {activeTab === "Holders" && <Owners owners={owners} />}
                        {activeTab === "Transfers" && (
                          <Transfers transfers={transfers} tokenSymbol={tokenDetails.symbol} chain={chain} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              <Footer />
            </>
          )
        }}
      </Header>
    </div>
  )
}

