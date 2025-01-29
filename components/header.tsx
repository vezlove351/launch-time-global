'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Rocket, ChevronDown, Menu, Moon, Sun, Compass, Wand2 } from 'lucide-react'
import { client, ChainKey, chains } from "../app/client"
import { ConnectButton } from "thirdweb/react"
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useTheme } from "@/context/ThemeContext"
import { NetworkIcon } from '@web3icons/react'
import { useNetwork } from '@/context/network'
import { useToast } from "@/hooks/use-toast"
import { getContractForChain,  } from "@/app/client";

const blockchains = [
  { name: 'Ethereum', id: 'Ethereum', networkId: 'ethereum', chainId: '0x1' },
  { name: 'Optimism', id: 'Optimism', networkId: 'optimism', chainId: '0xA' },
  { name: 'Avalanche', id: 'Avalanche', networkId: 'avalanche', chainId: '0xA86A' },
  { name: 'BNB Smart Chain', id: 'BNB Smart Chain', networkId: 'bsc', chainId: '0x38' },
  { name: 'Arbitrum One', id: 'Arbitrum One', networkId: 'arbitrum', chainId: '0xA4B1' },
  { name: 'Base', id: 'Base', networkId: 'base', chainId: '0x2105' },
] as const;

type HeaderProps = {
  children: React.ReactNode | ((props: { selectedNetwork: typeof blockchains[number] }) => React.ReactNode);
};

export function Header({ children }: HeaderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { chain, setChain } = useNetwork()
  const selectedNetwork = blockchains.find(b => b.networkId === chain) || blockchains[0]

  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const switchNetwork = async (chainId: string) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        return true;
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            const network = blockchains.find(b => b.chainId === chainId);
            if (!network) throw new Error('Network configuration not found');
          
            const rpcUrl = process.env[`NEXT_PUBLIC_${network.networkId.toUpperCase()}_RPC_URL`];
            if (!rpcUrl) throw new Error(`RPC URL not found for ${network.name}`);

            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: network.chainId,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.name,
                    symbol: network.networkId.toUpperCase(),
                    decimals: 18
                  },
                  rpcUrls: [rpcUrl],
                  blockExplorerUrls: [`https://${network.networkId}scan.com/`]
                },
              ],
            });
            return true;
          } catch (addError) {
            console.error('Error adding the network to MetaMask:', addError);
            return false;
          }
        }
        console.error('Error switching network:', switchError);
        return false;
      }
    } else {
      console.error('MetaMask is not installed');
      return false;
    }
  };

  const handleNetworkChange = async (networkId: string) => {
    const network = blockchains.find(b => b.networkId === networkId);
    if (!network) {
      toast({
        title: "Error",
        description: "Invalid network selected",
        variant: "destructive",
      });
      return;
    }

    const success = await switchNetwork(network.chainId);
    if (success) {
      setChain(networkId as ChainKey);
      try {
        const newContract = getContractForChain(networkId as ChainKey);
        // Here you might want to update the contract in your global state or context
        toast({
          title: "Network Changed",
          description: `Successfully switched to ${network.name}`,
        });
      } catch (error) {
        console.error('Error getting contract for chain:', error);
        toast({
          title: "Error",
          description: "Failed to get contract for the selected network.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to switch network. Please try again or switch manually in MetaMask.",
        variant: "destructive",
      });
    }

    setIsDropdownOpen(false);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <header className="py-2 px-4 md:px-4 bg-gray-800">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
              <Rocket className="w-6 h-6" />
              Launch Time
            </Link>
            <div className="hidden md:block relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-white px-3 py-2 rounded hover:bg-gray-800 mt-1"
              >
                <NetworkIcon 
                  key={chain}
                  network={chain} 
                  variant="branded" 
                  className="w-6 h-6 mr-2" 
                />
                {selectedNetwork.name}
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                  <ul className="py-1">
                    {blockchains.map((chain) => (
                      <li key={chain.name}>
                        <a
                          href="#"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-600"
                          onClick={() => handleNetworkChange(chain.networkId)}
                        >
                          <NetworkIcon network={chain.networkId} variant="branded" className="w-6 h-6 mr-2" />
                          {chain.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-10 mr-2">
                <Link href="/explore" className="text-gray-300 hover:text-white transition-colors">
                <div className="flex items-center gap-2">
                <Compass className="h-4 w-4" /> Explore
                </div>
                </Link>
                <Link href="/create-token" className="text-gray-300 hover:text-white transition-colors">
                <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" /> Create Token
                </div>
                </Link>
                
              </nav>
              <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-300 hover:text-gray-900 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            </div>
            {isMounted && (
              <div className="hidden md:flex items-center" suppressHydrationWarning>
                <ConnectButton client={client} />
              </div>
            )}
            <div className="md:hidden flex items-center space-x-2">
              <NetworkIcon 
                key={chain}
                network={chain} 
                variant="branded" 
                className="w-6 h-6 mr-2" 
              />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-gray-900 flex flex-col">
                  <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
                    <Rocket className="w-6 h-6" />
                    Launch Time
                  </Link>
                  <SheetTitle className="text-white mt-8">AI-powered meme launchpad</SheetTitle>
                  <nav className="flex flex-col space-y-4 mt-4">
                    <Link href="/explore" className="text-gray-300 hover:text-white transition-colors">
                    <div className="flex items-center gap-2">
                <Compass className="h-4 w-4" /> Explore
                </div>
                    </Link>
                    <Link href="/create-token" className="text-gray-300 hover:text-white transition-colors">
                    <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" /> Create token
                </div>
                    </Link>
                   {/*  <Link href="/ai-agents" className="text-gray-300 hover:text-white transition-colors">
                      AI Agents <span className="text-sm ml-4 bg-[#4F46E5] pl-2 pr-2 rounded-sm">next release</span>
                    </Link> */}
                  </nav>
                  <div className="mt-auto">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between text-white bg-gray-800 px-4 py-2 rounded w-full mb-2"
                    >
                      <div className="flex items-center">
                        <NetworkIcon key={chain} network={chain} variant="branded" className="w-6 h-6 mr-2" />
                        {selectedNetwork.name}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {isDropdownOpen && (
                      <div className="w-full bg-gray-700 rounded-md shadow-lg mb-4">
                        <ul className="py-1">
                          {blockchains.map((chain) => (
                            <li key={chain.name}>
                              <a
                                href="#"
                                className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-600"
                                onClick={() => handleNetworkChange(chain.networkId)}
                              >
                                <NetworkIcon network={chain.networkId} variant="branded" className="w-6 h-6 mr-2" />
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
            </div>
          </div>
        </div>
      </header>
      {typeof children === 'function'
        ? children({ selectedNetwork })
        : children}
    </>
  )
}

