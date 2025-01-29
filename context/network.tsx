'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { chains, ChainKey } from '@/app/client'

type NetworkContextType = {
  chain: ChainKey
  setChain: (chain: ChainKey) => void
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chain, setChain] = useState<ChainKey>('ethereum')

  useEffect(() => {
    const storedChain = localStorage.getItem('selectedChain') as ChainKey | null
    if (storedChain && Object.keys(chains).includes(storedChain)) {
      setChain(storedChain)
    }
  }, [])

  const updateChain = (newChain: ChainKey) => {
    setChain(newChain)
    localStorage.setItem('selectedChain', newChain)
  }

  return (
    <NetworkContext.Provider value={{ chain, setChain: updateChain }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}

