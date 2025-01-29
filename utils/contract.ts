import { ethers } from "ethers"
import { factoryAbi } from "./abis/factoryAbi"
import { prepareContractCall } from "thirdweb"
import { useReadContract, useSendTransaction } from "thirdweb/react"
import { client, getContractForChain, type ChainKey } from "@/app/client"

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider
  }
}

function isEthereumProvider(ethereum: unknown): ethereum is ethers.Eip1193Provider {
  return (
    typeof ethereum === "object" &&
    ethereum !== null &&
    "request" in ethereum &&
    typeof (ethereum as { request: unknown }).request === "function"
  )
}


export async function getEthereumContract() {
  if (typeof window !== "undefined" && window.ethereum && isEthereumProvider(window.ethereum)) {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT

    if (!contractAddress) {
      throw new Error("Contract address is not defined")
    }

    return new ethers.Contract(contractAddress, factoryAbi, signer)
  }
  throw new Error("Ethereum provider not found")
}

export async function getTokenContract(tokenAddress: string) {
  if (typeof window !== "undefined" && window.ethereum && isEthereumProvider(window.ethereum)) {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const erc20Abi = [
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address account) view returns (uint256)",
      "function transfer(address recipient, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
    ]

    return new ethers.Contract(tokenAddress, erc20Abi, signer)
  }
  throw new Error("Ethereum provider not found")
}

export async function createMemeToken(name: string, symbol: string, imageUrl: string, description: string) {
  console.log("Creating token with:", { name, symbol, imageUrl, description })
  const contract = await getEthereumContract()
  const tx = await contract.createMemeToken(name, symbol, imageUrl, description, {
    value: ethers.parseEther("0.01"), // This is the creation fee
  })
  await tx.wait()
  return tx.hash
}

export function useCalculateCost(chainKey: ChainKey, currentSupply: string, tokensToBuy: string) {
  const contract = getContractForChain(chainKey)

  return useReadContract({
    contract,
    method: "function calculateCost(uint256 currentSupply, uint256 tokensToBuy) pure returns (uint256)",
    params: [BigInt(currentSupply), BigInt(tokensToBuy)],
  })
}

export function useBuyMemeToken(chainKey: ChainKey) {
  const contract = getContractForChain(chainKey)
  const { mutate: sendTransaction } = useSendTransaction()

  return async (memeTokenAddress: string, tokenQty: string) => {
    try {
      // Fetch the token data to get the total supply
      const { data: tokenData } = await useReadContract({
        contract,
        method: "function addressToMemeTokenMapping(address) returns (string, string, string, string, uint256, address, address)",
        params: [memeTokenAddress],
      })

      console.log("Token data:", tokenData)

      if (!Array.isArray(tokenData) || tokenData.length < 7) {
        throw new Error("Invalid token data structure")
      }

      const [name, symbol, description, imageUrl, totalSupply, tokenContractAddress, creatorAddress] = tokenData

      if (typeof totalSupply === "undefined") {
        throw new Error("Failed to fetch total supply")
      }

      // Calculate the cost right before the transaction
      const { data: costInWei } = await useReadContract({
        contract,
        method: "function calculateCost(uint256, uint256) pure returns (uint256)",
        params: [totalSupply, BigInt(tokenQty)]
      })

      const transaction = prepareContractCall({
        contract,
        method: "function buyMemeToken(address memeTokenAddress, uint256 tokenQty) payable returns (uint256)",
        params: [memeTokenAddress, BigInt(tokenQty)],
        value: costInWei,
      })

      const result = await sendTransaction(transaction)
      return result
    } catch (error: any) {
      console.error("Error in buyMemeToken:", error)
      if (error.reason === "Incorrect value of ETH sent") {
        throw new Error("The amount of ETH sent does not match the calculated cost. Please try again.")
      }
      throw error
    }
  }
}



export async function getAllMemetokens() {
  const contract = await getEthereumContract()
  const tokens = await contract.getAllMemeTokens()
  return tokens
}

