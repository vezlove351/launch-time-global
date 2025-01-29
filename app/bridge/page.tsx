'use client'

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import { Bridge } from "@/components/bridge"

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A2F4E] to-[#1A2435] flex flex-col">
      <Header>
        {({ selectedNetwork }) => (
          <span>Connected to {selectedNetwork.name}</span>
        )}
      </Header>
      <main className="flex-grow container px-4 mx-auto max-w-6xl py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Bridge</h1>
        <Bridge />
      </main>
      <Footer />
    </div>
  )
}
