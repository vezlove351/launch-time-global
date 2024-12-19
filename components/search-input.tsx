import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search tokens..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
      />
    </div>
  )
}

