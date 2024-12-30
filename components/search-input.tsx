import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { useTheme } from "@/context/ThemeContext"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const { theme } = useTheme()

  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
      <Input
        type="text"
        placeholder="Search tokens..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 ${
          theme === 'light'
            ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            : 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400'
        }`}
      />
    </div>
  )
}

