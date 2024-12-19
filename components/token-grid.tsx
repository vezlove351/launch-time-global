import { TokenCard }  from "@/components/token-card"

interface Token {
  name: string
  symbol: string
  description: string
  tokenImageUrl: string
  fundingRaised: string
  tokenAddress: string
  creatorAddress: string
}

interface MemeToken {
  name: string
  symbol: string
  description: string
  tokenImageUrl: string
  fundingRaised: string
  tokenAddress: string
  creatorAddress: string
}

interface TokenGridProps {
  tokens: Token[]
}

export function TokenGrid({ tokens }: TokenGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tokens.map((token) => (
        <TokenCard key={token.tokenAddress} token={token} />
      ))}
    </div>
  )
}

