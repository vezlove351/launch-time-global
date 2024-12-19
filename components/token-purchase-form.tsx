import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ethers } from 'ethers'
import { buyMemeToken, calculateCost } from '@/utils/contract'

interface TokenPurchaseFormProps {
  tokenSymbol: string
  tokenAddress: string
  totalSupply: string
}

export function TokenPurchaseForm({ tokenSymbol, tokenAddress, totalSupply }: TokenPurchaseFormProps) {
  const [amount, setAmount] = useState('200')
  const [cost, setCost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const updateCost = useCallback(async (amount: string) => {
    if (!amount) {
      setCost('')
      return
    }
    try {
      const costInWei = await calculateCost(totalSupply, amount)
      setCost(ethers.formatUnits(costInWei, 'ether'))
    } catch (error) {
      console.error('Error calculating cost:', error)
      toast({
        title: "Error",
        description: "Failed to calculate cost. Please try again.",
        variant: "destructive",
      })
    }
  }, [totalSupply, toast])

  useEffect(() => {
    updateCost(amount)
  }, [amount, updateCost])

  useEffect(() => {
    updateCost('200')
  }, [updateCost])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const txHash = await buyMemeToken(tokenAddress, amount)
      toast({
        title: "Purchase Successful",
        description: `Transaction hash: ${txHash}`,
      })
      setAmount('')
      setCost('')
    } catch (error: any) {
      console.error('Error purchasing token:', error)
      let errorMessage = "Failed to purchase token. Please try again."
      if (error.message.includes("Invalid token data structure")) {
        errorMessage = "There was an issue with the token data. Please try again later."
      } else if (error.message.includes("Failed to fetch total supply")) {
        errorMessage = "Unable to retrieve token supply information. Please try again later."
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Buy token</h2>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount of tokens to buy"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            updateCost(e.target.value)
          }}
          className="bg-gray-700 text-white border-gray-600"
          required
        />
      </div>
      {cost && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Estimated Cost:</span>
          <span className="text-sm text-white">{cost} ETH</span>
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-lg py-6"
        disabled={isLoading || !cost}
      >
        {isLoading ? 'Processing...' : `Buy ${tokenSymbol} Tokens`}
      </Button>
    </form>
  )
}

