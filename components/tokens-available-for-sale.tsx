import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface TokensAvailableForSaleProps {
  remainingTokens: number
  maxSupply: number
}

export function TokensAvailableForSale({ remainingTokens, maxSupply }: TokensAvailableForSaleProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border-1">
      <div className="flex items-center mb-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mr-2">Available for Sale</h2>
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
      <div className="flex justify-between items-center mb-1">
        <p className="text-md mb-4 text-gray-900 dark:text-white">
          Remaining Tokens: {remainingTokens.toLocaleString()} / {maxSupply.toLocaleString()}
        </p>
      </div>
      <Progress value={(remainingTokens / maxSupply) * 100} className="mb-1" />
    </div>
  )
}

