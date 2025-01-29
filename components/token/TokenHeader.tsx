import Image from "next/image"
import { TokenCard } from "@/components/token-card"

interface TokenHeaderProps {
  tokenDetails: {
    name: string
    symbol: string
    description: string
    tokenImageUrl: string
    fundingRaised: string
    tokenAddress: string
    creatorAddress: string
  }
}

export function TokenHeader({ tokenDetails }: TokenHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 mb-8">
      <div className="w-full lg:w-1/2 space-y-6">
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <Image
            src={tokenDetails.tokenImageUrl || "/placeholder.svg"}
            alt={tokenDetails.name}
            width={500}
            height={500}
            className="p-0 w-full h-full object-cover border-2 border-gray-800/50 rounded-2xl"
          />
        </div>
      </div>
      <div className="w-full lg:w-1/2 space-y-6">
        <TokenCard token={tokenDetails} />
        <div className="flex justify-between mb-4 p-4">
          <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Website</span>
          </a>
          <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
            <span>Twitter</span>
          </a>
          <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span>Github</span>
          </a>
        </div>
      </div>
    </div>
  )
}

