'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Rocket, ChevronDown, Menu } from 'lucide-react'
import { client } from "../app/client";
import { ConnectButton } from "thirdweb/react";
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function Header() {
  const [isMounted, setIsMounted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const blockchains = [
    { name: 'Avalanche', link: '#' },
    { name: 'Binance Smart Chain', link: '#' },
    { name: 'Base', link: '#' },
    { name: 'Optimism', link: '#' },
    { name: 'Arbitrum', link: '#' },
  ]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="py-4 px-4 md:px-6 bg-gray-900/80">
      <div className="container mx-auto max-w-6xl flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          Launch Time
        </Link>
        <div className="flex items-center space-x-4">
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-gray-900 flex flex-col">
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          Launch Time
        </Link>
              <SheetTitle className="text-white mt-8">...</SheetTitle>
              <nav className="flex flex-col space-y-4 mt-4">
                <Link href="/explore" className="text-gray-300 hover:text-white transition-colors">
                  Explore
                </Link>
                <Link href="/create-token" className="text-gray-300 hover:text-white transition-colors">
                  Create Token
                </Link>
                <Link href="/ai-agents" className="text-gray-300 hover:text-white transition-colors">
                  AI Agents <span className="text-sm ml-4 bg-[#4F46E5] pl-2 pr-2 rounded-sm">next release</span>
                </Link>
              </nav>
              <div className="mt-auto">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between text-white bg-gray-800 px-4 py-2 rounded w-full mb-2"
                >
                  Ethereum
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isDropdownOpen && (
                  <div className="w-full bg-gray-700 rounded-md shadow-lg mb-4">
                    <ul className="py-1">
                      {blockchains.map((chain) => (
                        <li key={chain.name}>
                          <a
                            href={chain.link}
                            className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                            onClick={() => {
                              setIsDropdownOpen(false)
                              setIsDrawerOpen(false)
                            }}
                          >
                            {chain.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {isMounted && (
                <div className="mt-4" suppressHydrationWarning>
                  <ConnectButton client={client} />
                </div>
              )}
            </SheetContent>
          </Sheet>
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-10">
              <Link href="/explore" className="text-gray-300 hover:text-white transition-colors">
                Explore
              </Link>
              <Link href="/create-token" className="text-gray-300 hover:text-white transition-colors">
                Create Token
              </Link>
              <Link href="/ai-agents" className="text-gray-300 hover:text-white transition-colors">
                AI Agents <span className="text-sm ml-4 bg-[#4F46E5] pl-2 pr-2 rounded-sm">test</span>
              </Link>
            </nav>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-white px-3 py-2 rounded"
              >
                Ethereum
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                  <ul className="py-1">
                    {blockchains.map((chain) => (
                      <li key={chain.name}>
                        <a
                          href={chain.link}
                          className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {chain.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {isMounted && (
            <div className="hidden md:flex items-center" suppressHydrationWarning>
              <ConnectButton client={client} />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

