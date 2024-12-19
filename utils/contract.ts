import { ethers } from 'ethers'
import { factoryAbi } from './abis/factoryAbi'

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider
  }
}

function isEthereumProvider(ethereum: unknown): ethereum is ethers.Eip1193Provider {
  return (
    typeof ethereum === 'object' &&
    ethereum !== null &&
    'request' in ethereum &&
    typeof (ethereum as { request: unknown }).request === 'function'
  )
}

export async function getEthereumContract() {
  if (typeof window !== 'undefined' && window.ethereum && isEthereumProvider(window.ethereum)) {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT

    if (!contractAddress) {
      throw new Error('Contract address is not defined')
    }
    
    return new ethers.Contract(contractAddress, factoryAbi, signer)
  }
  throw new Error('Ethereum provider not found')
}

export async function getTokenContract(tokenAddress: string) {
  if (typeof window !== 'undefined' && window.ethereum && isEthereumProvider(window.ethereum)) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const erc20Abi = [
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address account) view returns (uint256)",
      "function transfer(address recipient, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ];

    return new ethers.Contract(tokenAddress, erc20Abi, signer);
  }
  throw new Error('Ethereum provider not found');
}

export async function createMemeToken(
  name: string,
  symbol: string,
  imageUrl: string,
  description: string
) {
  console.log('Creating token with:', { name, symbol, imageUrl, description });
  const contract = await getEthereumContract()
  const tx = await contract.createMemeToken(
    name,
    symbol,
    imageUrl,
    description,
    {
      value: ethers.parseEther('0.0001') // This is the creation fee
    }
  )
  await tx.wait()
  return tx.hash
}


export async function calculateCost(totalSupply: string, amount: string) {
  const contract = await getEthereumContract()
  const costInWei = await contract.calculateCost(totalSupply, amount)
  return costInWei
}

export async function buyMemeToken(tokenAddress: string, amount: string) {
  const contract = await getEthereumContract()
  try {
    // Fetch the token data to get the total supply
    const tokenData: [string, string, string, string, ethers.BigNumberish, string, string] = await contract.addressToMemeTokenMapping(tokenAddress)
    
    console.log('Token data:', tokenData)

    if (!Array.isArray(tokenData) || tokenData.length < 7) {
      throw new Error("Invalid token data structure")
    }

    const [name, symbol, description, imageUrl, totalSupply, tokenContractAddress, creatorAddress] = tokenData

    if (typeof totalSupply === 'undefined') {
      throw new Error("Failed to fetch total supply")
    }

    // Calculate the cost right before the transaction
    const costInWei = await calculateCost(totalSupply.toString(), amount)
    const tx = await contract.buyMemeToken(tokenContractAddress, amount, {
      value: costInWei
    })
    const receipt = await tx.wait()
    return receipt.hash
  } catch (error: any) {
    console.error('Error in buyMemeToken:', error)
    if (error.reason === "Incorrect value of ETH sent") {
      throw new Error("The amount of ETH sent does not match the calculated cost. Please try again.")
    }
    throw error
  }
}


export async function getAllMemetokens() {
  const contract = await getEthereumContract()
  const tokens = await contract.getAllMemeTokens()
  return tokens
}

