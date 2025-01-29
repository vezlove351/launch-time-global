"use client"

import { useEffect, useState, useCallback } from "react"
import { ethers } from "ethers"
import { useParams, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TokenCard } from "@/components/token-card"
import { TokenPurchaseForm } from "@/components/token-purchase-form"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { PriceChart } from "@/components/price-chart"
import { useToast } from "@/hooks/use-toast"
import { useReadContract } from "thirdweb/react"
import { getContractForChain, type ChainKey } from "@/app/client"
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
};

// Constants
const fundingGoal = 24
const maxSupply = 800000

export default function TokenDetails() {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null)
  const [owners, setOwners] = useState<Owner[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [remainingTokens, setRemainingTokens] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { chain } = useNetwork()

  // Extract the address from params
  const address = params?.id as string
  const network = (searchParams?.get("network") || "ethereum") as ChainKey

  const contract = getContractForChain(chain as ChainKey)

  const { data: tokenData, isLoading: isTokenDataLoading } = useReadContract({
    contract,
    method:
      "function addressToMemeTokenMapping(address) view returns (string name, string symbol, string description, string tokenImageUrl, uint256 fundingRaised, address tokenAddress, address creatorAddress)",
    params: [address],
    
  })

  const { data: totalSupplyData, isLoading: isTotalSupplyLoading } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
    params: [],
  })

  const { data: costData, isLoading: isCostLoading } = useReadContract({
    contract,
    method: "function calculateCost(uint256 totalTokens, uint256 tokenQty) view returns (uint256)",
    params: [BigInt(totalSupplyData || 0), BigInt(purchaseAmount || 0)],
  })

  useEffect(() => {
    if (tokenData && !isTokenDataLoading) {
      const totalSupplyFormatted = Number.parseInt(ethers.formatUnits(totalSupplyData || "0", "ether"))
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
    }
  }, [tokenData, totalSupplyData, isTokenDataLoading, isTotalSupplyLoading])

  useEffect(() => {
    const fetchOwnersAndTransfers = async () => {
      try {
        const ownersResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/${address}/owners?chain=${chain}&order=DESC`,
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
          `https://deep-index.moralis.io/api/v2.2/erc20/${address}/transfers?chain=${chain}&order=DESC`,
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

    if (address && chain) {
      fetchOwnersAndTransfers()
    }
  }, [address, chain, toast])

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col items-center justify-center">
        <p className="text-center text-red-500 text-xl">Invalid token address: Address not found in URL parameters</p>
      </div>
    )
  }

  if (isTokenDataLoading || isTotalSupplyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col items-center justify-center">
        <p className="text-center text-white text-xl">Loading token details...</p>
      </div>
    )
  }

  if (!tokenDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col items-center justify-center">
        <p className="text-center text-red-500 text-xl">Failed to load token details</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-100 dark:from-[#2A2F4E] dark:to-[#1A2435]">
      <Header>
        {({ selectedNetwork }) => {

          return (
            <>
              <main className="flex-grow container px-4 mx-auto max-w-6xl py-16">
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                  {/* Left side */}
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6">
                      <Image
                        src={tokenDetails.tokenImageUrl || "/placeholder.svg"}
                        alt={tokenDetails.name}
                        width={500}
                        height={500}
                        className="p-0 w-full h-full object-cover border-2 border-gray-300/50 dark:border-gray-800/50 rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="w-full lg:w-1/2 space-y-6">
                    <TokenCard token={tokenDetails} />
                    <TokenPurchaseForm
                      tokenSymbol={tokenDetails.symbol}
                      tokenAddress={tokenDetails.tokenAddress}
                      totalSupply={tokenDetails.totalSupply}
                      network={network}
                    />
                  </div>
                </div>

                {/* Bonding Curve Progress and Tokens Available for Sale */}
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6">
                      <div className="flex items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                          Bonding Curve Progress
                        </h2>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-5 h-5 text-gray-900 dark:text-white" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm max-w-xs">
                                When the market cap reaches {tokenDetails.bondingCurveMax} ETH, all the liquidity from
                                the bonding curve will be deposited into Uniswap, and the LP tokens will be burned.
                                Progression increases as the price goes up.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-md mb-4 text-gray-900 dark:text-white">
                          {tokenDetails.fundingRaised} / {tokenDetails.bondingCurveMax} ETH
                        </p>
                      </div>
                      <Progress
                        value={(tokenDetails.bondingCurveProgress / tokenDetails.bondingCurveMax) * 100}
                        className="mb-2"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6">
                      <div className="flex items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                          Tokens Available for Sale
                        </h2>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-5 h-5 text-gray-900 dark:text-white" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm max-w-xs">
                                The number of tokens still available for purchase out of the total supply.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-md mb-4 text-gray-900 dark:text-white">
                          Remaining Tokens: {remainingTokens.toLocaleString()} /
                          {maxSupply.toLocaleString()}
                         
                        </p>
                      </div>
                      <Progress value={(remainingTokens / maxSupply) * 100} className="mb-2" />
                    </div>
                  </div>
                </div>

                <div className="h-[500px] mt-6 p-4">
                  <PriceChart />
                </div>

                <div className="bg-gray-800/50 rounded-2xl p-6 mt-6">
                  <h2 className="text-2xl font-bold text-white mr-2 p-2">Owners</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Owner Address</TableHead>
                        <TableHead>Percentage of Total Supply</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {owners.map((owner, index) => (
                        <TableRow key={index}>
                          <TableCell>{owner.owner_address}</TableCell>
                          <TableCell>{owner.percentage_relative_to_total_supply}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-gray-800/50 rounded-2xl p-6 mt-6">
                  <h3 className="text-2xl font-bold text-white mr-2 p-2">Transfers</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From Address</TableHead>
                        <TableHead>To Address</TableHead>
                        <TableHead>Value {tokenDetails.symbol}</TableHead>
                        <TableHead>Transaction Hash</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfers.map((transfer, index) => (
                        <TableRow key={index}>
                          <TableCell>{`${transfer.from_address.slice(0, 6)}...${transfer.from_address.slice(-4)}`}</TableCell>
                          <TableCell>{`${transfer.to_address.slice(0, 6)}...${transfer.to_address.slice(-4)}`}</TableCell>
                          <TableCell>{transfer.value_decimal}</TableCell>
                          <TableCell>
                            <a
                              href={`https://${chain}scan.com/tx/${transfer.transaction_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {transfer.transaction_hash}
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

