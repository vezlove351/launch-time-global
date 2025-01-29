import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface TabBarProps {
  tabs: string[]
  onTabChange: (tab: string) => void
  userRequestCount: number
  hideHumanMessages: boolean
  onHideHumanMessagesChange: (checked: boolean) => void
  isTokenOwner: boolean
}

export function TabBar({
  tabs,
  onTabChange,
  userRequestCount,
  hideHumanMessages,
  onHideHumanMessagesChange,
  isTokenOwner,
}: TabBarProps) {
  const [activeTab, setActiveTab] = useState(tabs[0])

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    onTabChange(tab)
  }

  return (
    <div className="flex justify-between items-center w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <Button key={tab} variant={activeTab === tab ? "default" : "ghost"} onClick={() => handleTabClick(tab)}>
            {tab}
          </Button>
        ))}
      </div>
      {isTokenOwner && (
        <div className="hidden sm:flex items-center space-x-8 px-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hideHumanMessages"
              checked={hideHumanMessages}
              onCheckedChange={(checked: boolean) => onHideHumanMessagesChange(checked)}
            />
            <label htmlFor="hideHumanMessages" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
              Hide Human Messages
            </label>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-x-2">
            Requests: <span className="font-bold">{userRequestCount}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-900 dark:text-white" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">
                    Stake $LAU to get credits to interact with AI Agent. 100 $LAU = 1 Credit = 1 Request.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  )
}

