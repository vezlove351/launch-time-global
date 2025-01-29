import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface BondingCurveProgressProps {
  fundingRaised: string
  bondingCurveMax: number
  bondingCurveProgress: number
}

export function BondingCurveProgress({
  fundingRaised,
  bondingCurveMax,
  bondingCurveProgress,
}: BondingCurveProgressProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border-1">
      <div className="flex items-center mb-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mr-2">Bonding Curve</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-5 h-5 text-gray-900 dark:text-white" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm max-w-xs">
                When the market cap reaches {bondingCurveMax} ETH, all the liquidity from the bonding curve will be
                deposited into Uniswap, and the LP tokens will be burned. Progression increases as the price goes up.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-md mb-4 text-gray-900 dark:text-white">
          {fundingRaised} / {bondingCurveMax} ETH
        </p>
      </div>
      <Progress value={(bondingCurveProgress / bondingCurveMax) * 100} className="mb-1" />
    </div>
  )
}

