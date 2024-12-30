import "./globals.css"
import { Outfit } from 'next/font/google'
import { ThirdwebProvider } from "thirdweb/react"
import { ThemeProvider } from "@/context/ThemeContext"



const outfit = Outfit({ subsets: ["latin"] })

export const metadata = {
  title: "Modern Web3 App",
  description: "A trusted and secure crypto exchange platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
       <ThirdwebProvider>
        <ThemeProvider>
          <body className={`${outfit.className} transition-colors duration-300`}>
            {children}
          </body>
        </ThemeProvider>
      </ThirdwebProvider>
      
    </html>
  )
}

