'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const WormholeConnect = dynamic(
  () => import('@wormhole-foundation/wormhole-connect').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <p className="text-white">Loading Wormhole Connect...</p>
  }
)

export function Bridge() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <WormholeConnect 
        theme={{
          palette: {
            mode: 'dark',
            primary: { main: '#4F46E5' },
            secondary: { main: '#6366F1' },
            background: { default: '#1F2937', paper: '#374151' },
          },
        }}
      />
    </div>
  )
}

