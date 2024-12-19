import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface NFTCardProps {
  id: string
  name: string
  image: string
  description: string
  superpower: string
  platforms: string[]
}

export function NFTCard({ id, name, image, description, superpower, platforms }: NFTCardProps) {
  const handleMint = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log(`Minting NFT: ${name}`)
    // Here you would implement the actual minting logic
  }

  return (
    <Link href={`/ai-agents/${id}`}>
      <Card className="p-6 bg-gray-800/50 border-0 rounded-2xl flex flex-col hover:bg-gray-700/50 transition-colors">
        <div className="relative w-full aspect-square mb-4">
          <Image
            src={image}
            alt={`${name} AI Agent`}
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <p className="text-sm text-gray-400 mb-4 flex-grow">{description}</p>
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-gray-300">Superpower: <span className="text-white">{superpower}</span></p>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <span key={platform} className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full">{platform}</span>
            ))}
          </div>
        </div>
       {/*  <Button onClick={handleMint} className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90">
          Mint NFT
        </Button> */}
      </Card>
    </Link>
  )
}

