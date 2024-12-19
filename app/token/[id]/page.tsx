'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TokenCard } from "@/components/token-card"
import { TokenPurchaseForm } from "@/components/token-purchase-form"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { PriceChart } from '@/components/price-chart'

import { useParams } from 'next/navigation'
import { ethers } from 'ethers'
import { factoryAbi } from '@/utils/abis/factoryAbi'
import { useToast } from "@/hooks/use-toast"
import { useCallback } from 'react'
// import { getEthereumContract } from '@/utils/contract' // Removed as per update 3

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
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Constants
const fundingGoal = 24;
const maxSupply = 800000;

export default function TokenDetails() {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null)
  const [owners, setOwners] = useState<Owner[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [cost, setCost] = useState('')
  const [isCostLoading, setIsCostLoading] = useState(false)
  const [remainingTokens, setRemainingTokens] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const params = useParams()
  const { toast } = useToast()

  // Extract the address from params
  const address = params?.id as string

  useEffect(() => {
    const fetchTokenDetails = async () => {
      console.log('Fetching Token Details...');
      setIsLoading(true);
      setError(null);

      if (!address) {
        setError('Invalid token address: Address not found in URL parameters');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching token details for address:', address);
        console.log('Environment Variables:', {
          RPC_URL: process.env.NEXT_PUBLIC_REACT_APP_RPC_URL,
          TOKEN_FACTORY_CONTRACT: process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT,
          MORALIS_API_KEY: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });

        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL);
        const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT;

        if (!contractAddress) throw new Error('Contract address is not defined');

        const contract = new ethers.Contract(contractAddress, factoryAbi, provider);
        const tokenData = await contract.addressToMemeTokenMapping(address);
        console.log('Token Data:', tokenData);

        if (!tokenData || !tokenData.name) {
          console.error('Token data not found or invalid:', tokenData);
          throw new Error(`Token not found for address: ${address}`);
        }

        // Fetch total supply
        const tokenContract = new ethers.Contract(address, ['function totalSupply() view returns (uint256)'], provider);
        const totalSupplyResponse = await tokenContract.totalSupply();
        const totalSupplyFormatted = parseInt(ethers.formatUnits(totalSupplyResponse, 'ether'));
        setTotalSupply(totalSupplyFormatted);

        // Calculate remaining tokens
        const remainingTokensCalculated = maxSupply - totalSupplyFormatted;
        setRemainingTokens(remainingTokensCalculated);

        setTokenDetails({
          name: tokenData.name,
          symbol: tokenData.symbol,
          description: tokenData.description,
          tokenImageUrl: isValidUrl(tokenData.tokenImageUrl) ? tokenData.tokenImageUrl : '/placeholder.svg',
          fundingRaised: ethers.formatEther(tokenData.fundingRaised),
          tokenAddress: tokenData.tokenAddress,
          creatorAddress: tokenData.creatorAddress,
          bondingCurveProgress: parseFloat(ethers.formatEther(tokenData.fundingRaised)),
          bondingCurveMax: fundingGoal,
          tokensAvailable: remainingTokensCalculated,
          totalTokens: maxSupply,
          totalSupply: totalSupplyFormatted.toString(),
        });

        // Owners & Transfers
        const ownersResponse = await fetch(`https://deep-index.moralis.io/api/v2.2/erc20/${address}/owners?chain=sepolia&order=DESC`, {
          headers: {
            accept: 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY || '',
          },
        });
        const ownersData = await ownersResponse.json();
        console.log('Owners Data:', ownersData);
        setOwners(ownersData.result || []);

        const transfersResponse = await fetch(`https://deep-index.moralis.io/api/v2.2/erc20/${address}/transfers?chain=sepolia&order=DESC`, {
          headers: {
            accept: 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY || '',
          },
        });
        const transfersData = await transfersResponse.json();
        console.log('Transfers Data:', transfersData);
        setTransfers(transfersData.result || []);
      } catch (error) {
        console.error('Error fetching token details:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch token details.');
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch token details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenDetails();
  }, [address, toast]);

  const getCost = useCallback(async () => {
    if (!purchaseAmount || !tokenDetails) return;

    setIsCostLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL);
      const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT;
      if (!contractAddress) throw new Error('Contract address is not defined');

      const contract = new ethers.Contract(contractAddress, factoryAbi, provider);
      const costInWei = await contract.calculateCost(tokenDetails.totalTokens, purchaseAmount);
      setCost(ethers.formatUnits(costInWei, 'ether'));
    } catch (error) {
      console.error('Error calculating cost:', error);
      toast({
        title: "Error",
        description: "Failed to calculate cost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCostLoading(false);
    }
  }, [purchaseAmount, tokenDetails, toast]);

  useEffect(() => {
    if (purchaseAmount) {
      getCost();
    } else {
      setCost('');
    }
  }, [purchaseAmount, getCost]);

  const handlePurchase = async () => {
    if (!purchaseAmount || !cost) return;

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT;
      if (!contractAddress) throw new Error('Contract address is not defined');

      const contract = new ethers.Contract(contractAddress, factoryAbi, signer);

      const transaction = await contract.buyMemeToken(address, purchaseAmount, {
        value: ethers.parseUnits(cost, 'ether'),
      });
      const receipt = await transaction.wait();

      toast({
        title: "Purchase Successful",
        description: `Transaction hash: ${receipt.hash}`,
      });
      
      // Reset purchase amount and cost after successful purchase
      setPurchaseAmount('');
      setCost('');
    } catch (error) {
      console.error('Error during purchase:', error);
      toast({
        title: "Error",
        description: "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col items-center justify-center">
        <p className="text-center text-red-500 text-xl">
          Invalid token address: Address not found in URL parameters
        </p>
        <p className="text-center text-gray-400 mt-4">
          Debug info: {JSON.stringify(params)}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col items-center justify-center">
        <p className="text-center text-white text-xl">Loading token details...</p>
      </div>
    );
  }

  if (error || !tokenDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col items-center justify-center">
        <p className="text-center text-red-500 text-xl">{error || 'Failed to load token details'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col">
      <Header />
      <main className="flex-grow container px-4 mx-auto max-w-6xl py-16">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left side */}
          <div className="w-full lg:w-1/2 space-y-6">
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <Image
              src={tokenDetails.tokenImageUrl}
              alt={tokenDetails.name}
              width={500}
              height={500}
              className="p-0 w-full h-full object-cover border-2 border-gray-800/50 rounded-2xl"
            /></div>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-1/2 space-y-6">
            <TokenCard token={tokenDetails} />
            <div className="flex justify-between mb-4 p-4">
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>Website</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                <span>Twitter</span>
              </a>
                <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                <span>Github</span>
              </a>
            </div>
            <TokenPurchaseForm 
              tokenSymbol={tokenDetails.symbol}
              tokenAddress={tokenDetails.tokenAddress}
              totalSupply={tokenDetails.totalSupply}
            />
          </div>
        </div>

        {/* New row for Bonding Curve Progress and Tokens Available for Sale */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-white mr-2">Bonding Curve Progress</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-5 h-5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        When the market cap reaches {tokenDetails.bondingCurveMax} ETH, all the liquidity from the bonding curve will be deposited into Uniswap, and the LP tokens will be burned. Progression increases as the price goes up.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-md mb-4 text-white">
                  {tokenDetails.fundingRaised} / {tokenDetails.bondingCurveMax} ETH
                </p>
              </div>
              <Progress value={(tokenDetails.bondingCurveProgress / tokenDetails.bondingCurveMax) * 100} className="mb-2" />
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-white mr-2">Tokens Available for Sale</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-5 h-5 text-gray-400" />
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
                <p className="text-md mb-4 text-white">
                  Remaining Tokens Available for Sale: {remainingTokens.toLocaleString()} / {maxSupply.toLocaleString()}
                </p>
              </div>
              <Progress value={(remainingTokens / maxSupply) * 100} className="mb-2" />
            </div>
          </div>
        </div>
      
        <div className="h-[500px] mt-6 p-4">
          <PriceChart 
 
          />
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
                      href={`https://sepolia.etherscan.io/tx/${transfer.transaction_hash}`} 
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
    </div>
  )
}

