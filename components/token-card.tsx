'use client'

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Copy } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from "@/context/ThemeContext"
import { useNetwork } from '@/context/network'

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
  const { theme } = useTheme()
  const { chain } = useNetwork()

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Link href={`/token/${token.tokenAddress}?network=${chain}`} passHref>
      <Card className={`p-6 ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white hover:bg-gray-100'} border-1 rounded-2xl flex flex-col transition-colors`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12">
            <Image
              src={imgSrc.startsWith('/') || imgSrc.startsWith('http') ? imgSrc : `/${imgSrc}`}
              alt={token.name}
              fill
              className={`p-0 w-full h-full object-cover border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg object-center`}
              onError={() => setImgSrc('/placeholder.svg')}
            />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{token.name}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{token.symbol}</p>
          </div>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4 break-words line-clamp-1 hover:line-clamp-none`}>{token.description}</p>
        <div className="space-y-2 mt-auto">
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Token Address:</span>
            <button 
              onClick={(e) => {
                e.preventDefault()
                copyToClipboard(token.tokenAddress, 'token')
              }}
              className={`text-sm ${theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} truncate ml-2 flex items-center transition-colors`}
              title={token.tokenAddress}
            >
              {token.tokenAddress.slice(0, 6)}...{token.tokenAddress.slice(-4)}
              <Copy className="w-4 h-4 ml-1" />
              {copiedField === 'token' && <span className="text-green-400 ml-2">Copied!</span>}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Created by:</span>
            <button 
              onClick={(e) => {
                e.preventDefault()
                copyToClipboard(token.creatorAddress, 'creator')
              }}
              className={`text-sm ${theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} truncate ml-2 flex items-center transition-colors`}
              title={token.creatorAddress}
            >
              {token.creatorAddress.slice(0, 6)}...{token.creatorAddress.slice(-4)}
              <Copy className="w-4 h-4 ml-1" />
              {copiedField === 'creator' && <span className="text-green-400 ml-2">Copied!</span>}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Funding Raised:</span>
            <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{token.fundingRaised}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

