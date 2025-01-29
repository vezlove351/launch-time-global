import "./globals.css"
import { Outfit } from 'next/font/google'
import { ThirdwebProvider } from "thirdweb/react"
import { ThemeProvider } from "@/context/ThemeContext"
import { NetworkProvider } from '@/context/network'

const outfit = Outfit({ subsets: ["latin"] })

export const metadata = {
  title: "Launch Time",
  description: "Create & promote your meme token across various platforms with powerful AI agents.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
       <ThirdwebProvider>
        <NetworkProvider>
          <ThemeProvider>
            <body className={`${outfit.className} transition-colors duration-300`}>
              {children}
            </body>
          </ThemeProvider>
        </NetworkProvider>
      </ThirdwebProvider>
    </html>
  )
}

