import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, Key, Wallet, Wand2 } from 'lucide-react'
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between py-16 lg:py-24 gap-12">
            {/* Left Column - Text Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left lg:w-2/3">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium text-emerald-400">
                <Zap className="w-4 h-4 text-[#4ADE80]" />
                <span className="text-[#4ADE80] tracking-wide">AI-powered meme launchpad</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Create & promote <br /> your meme token
              </h1>
              
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              Promote your token across various platforms with powerful AI agents.
              </p>
            
                 <Link href="/explore">
                <Button size="lg" className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 rounded-full text-lg px-8 py-6 mt-6">
                  Explore Community
                </Button>
              </Link>
           
             
            </div>

            {/* Right Column - Image */}
            <div className="lg:w-1/3">
              <Image
                src="/hero.png"
                alt="Crypto trading platform visualization"
                width={500}
                height={500}
                className="w-full"
                priority
              />
            </div>
          </div>

          {/* Feature Cards Container */}
          <div className="bg-gray-900/80 rounded-[32px] p-8 mb-16">
            <div className="grid md:grid-cols-3 gap-6">
               <FeatureCard
                icon={<Wallet className="w-10 h-10 text-pink-400" />}
                title="Connect your wallet"
                description="Use metamask with any supported chains"
              />
              
               <FeatureCard
                icon={<Wand2 className="w-10 h-10 text-purple-400" />}
                title="Create a meme"
                description="Create meme coin in 1 minute and start trading"
              />
              
              <FeatureCard
                icon={<Key className="w-10 h-10 text-[#4ADE80]" />}
                title="Promote"
                description="Use our AI Agents to promote your token"
              />
             
             
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="p-6 bg-gray-800/50 border-0 rounded-2xl">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-gray-700/50 rounded-xl">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  )
}

