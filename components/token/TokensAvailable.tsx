import { Progress } from "@/components/ui/progress"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TokensAvailableProps {
  remainingTokens: number
  maxSupply: number
}

export function TokensAvailable({ remainingTokens, maxSupply }: TokensAvailableProps) {
  return (
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
  )
}

