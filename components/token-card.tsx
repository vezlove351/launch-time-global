import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Copy } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface MemeToken {
  name: string
  symbol: string
  description: string
  tokenImageUrl: string
  fundingRaised: string
  tokenAddress: string
  creatorAddress: string
}

export function TokenCard({ token }: { token: MemeToken }) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [imgSrc, setImgSrc] = useState(token.tokenImageUrl || '/placeholder.svg')

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Link href={`/token/${token.tokenAddress}`} passHref>
      <Card className="p-6 bg-gray-800/50 border-0 rounded-2xl flex flex-col hover:bg-gray-700/50 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12">
            <Image
              src={imgSrc.startsWith('/') || imgSrc.startsWith('http') ? imgSrc : `/${imgSrc}`}
              alt={token.name}
              fill
              className="p-0 w-full h-full object-cover border-2 border-gray-700 rounded-lg object-center"
          
              onError={() => setImgSrc('/placeholder.svg')}
            />
         {/*  {token.tokenImageUrl && (
               <img src={token.tokenImageUrl || '/placeholder.svg'} alt={token.name} className="w-full h-full object-cover" />
             )}  */}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{token.name}</h3>
            <p className="text-sm text-gray-400">{token.symbol}</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-4 break-words line-clamp-1 hover:line-clamp-none">{token.description}</p>
        <div className="space-y-2 mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400">Token Address:</span>
            <button 
              onClick={(e) => {
                e.preventDefault()
                copyToClipboard(token.tokenAddress, 'token')
              }}
              className="text-sm text-white truncate ml-2 flex items-center hover:text-blue-400 transition-colors"
              title={token.tokenAddress}
            >
              {token.tokenAddress.slice(0, 6)}...{token.tokenAddress.slice(-4)}
              <Copy className="w-4 h-4 ml-1" />
              {copiedField === 'token' && <span className="text-green-400 ml-2">Copied!</span>}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400">Created by:</span>
            <button 
              onClick={(e) => {
                e.preventDefault()
                copyToClipboard(token.creatorAddress, 'creator')
              }}
              className="text-sm text-white truncate ml-2 flex items-center hover:text-blue-400 transition-colors"
              title={token.creatorAddress}
            >
              {token.creatorAddress.slice(0, 6)}...{token.creatorAddress.slice(-4)}
              <Copy className="w-4 h-4 ml-1" />
              {copiedField === 'creator' && <span className="text-green-400 ml-2">Copied!</span>}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400">Funding Raised:</span>
            <span className="text-sm text-white">{token.fundingRaised}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

