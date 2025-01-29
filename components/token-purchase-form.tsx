import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { prepareContractCall } from "thirdweb"
import { useSendTransaction, useReadContract } from "thirdweb/react"
import { useTheme } from "@/context/ThemeContext"
import { getContractForChain, type ChainKey } from "@/app/client"

interface TokenPurchaseFormProps {
  tokenSymbol: string
  tokenAddress: string
  totalSupply: string
  network: ChainKey
}

export function TokenPurchaseForm({ tokenSymbol, tokenAddress, totalSupply, network }: TokenPurchaseFormProps) {
  const [amount, setAmount] = useState("200")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { theme } = useTheme()
  const { mutate: sendTransaction } = useSendTransaction()

  const contract = getContractForChain(network)

  const { data: costData, isLoading: isCostLoading } = useReadContract({
    contract,
    method: "function calculateCost(uint256 currentSupply, uint256 tokensToBuy) pure returns (uint256)",
    params: [BigInt(totalSupply), BigInt(amount)],
  })

  const cost = costData ? ethers.formatUnits(costData, "ether") : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function buyMemeToken(address memeTokenAddress, uint256 tokenQty) payable returns (uint256)",
        params: [tokenAddress, BigInt(amount)],
        value: costData, // Use the calculated cost as the value to send
      })

      await sendTransaction(transaction)

      toast({
        title: "Purchase Initiated",
        description: "Transaction submitted successfully",
      })

      setAmount("")
    } catch (error: any) {
      console.error("Error purchasing token:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to purchase token. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${theme === "light" ? "bg-gray-100" : "bg-gray-800/50"} rounded-2xl p-6 space-y-4`}
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Buy token</h2>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount of tokens to buy"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      {cost && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Estimated Cost:</span>
          <span className={`text-sm ${theme === "light" ? "text-gray-900" : "text-white"}`}>{cost} ETH</span>
        </div>
      )}
      <Button
        type="submit"
        className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-lg py-6 rounded-full"
        disabled={isLoading || isCostLoading || !cost}
      >
        {isLoading ? "Processing..." : `Buy ${tokenSymbol} Tokens`}
      </Button>
    </form>
  )
}

