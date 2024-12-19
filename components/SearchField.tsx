'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface SearchFieldProps {
  onSearch: (term: string) => void
}

export default function SearchField({ onSearch }: SearchFieldProps) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, onSearch])

  return (
    <div className="relative mb-8">
      <Input
        type="text"
        placeholder="Search tokens..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

