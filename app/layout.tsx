import "./globals.css"
import { Outfit } from 'next/font/google'
import { ThirdwebProvider } from "thirdweb/react";

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
      <body className={outfit.className}>{children}</body>
      </ThirdwebProvider>
      
    </html>
  )
}

