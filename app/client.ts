import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create the client with your clientId
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
});

// Define multiple chains
export const chains = {
  ethereum: defineChain(1),
  optimism: defineChain(11155420),
  base: defineChain(84532),
  avalanche: defineChain(43114),
  bsc: defineChain(56),
  arbitrum: defineChain(42161),
};

export type ChainKey = keyof typeof chains;

// Function to get contract based on the chain
export const getContractForChain = (chainKey: ChainKey) => {
  const chain = chains[chainKey];
  if (!chain) {
    throw new Error(`Chain ${chainKey} not supported`);
  }

  // Switch contract address based on chain ID
  let contractAddress: string;
  switch (chain.id) {
    case 1: // Ethereum Mainnet
      contractAddress = process.env.NEXT_PUBLIC_ETHEREUM_TOKEN_FACTORY_CONTRACT as string;
      break;
    case 11155420: // Optimism
      contractAddress = process.env.NEXT_PUBLIC_OPTIMISM_TOKEN_FACTORY_CONTRACT as string;
      break;
    case 84532: // Base
      contractAddress = process.env.NEXT_PUBLIC_BASE_TOKEN_FACTORY_CONTRACT as string;
      break;
    case 43114: // Avalanche
      contractAddress = process.env.NEXT_PUBLIC_AVALANCHE_TOKEN_FACTORY_CONTRACT as string;
      break;
    case 56: // BSC
      contractAddress = process.env.NEXT_PUBLIC_BSC_TOKEN_FACTORY_CONTRACT as string;
      break;
    case 42161: // Arbitrum One
      contractAddress = process.env.NEXT_PUBLIC_ARBITRUM_TOKEN_FACTORY_CONTRACT as string;
      break;
    default:
      throw new Error(`No contract address configured for chain ID ${chain.id}`);
  }

  return getContract({
    client,
    chain,
    address: contractAddress,
  });
};

// Function to get RPC URL for a chain
export const getRpcUrlForChain = (chainKey: ChainKey): string => {
  switch (chainKey) {
    case 'ethereum':
      return process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL as string;
    case 'optimism':
      return process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL as string;
    case 'base':
      return process.env.NEXT_PUBLIC_BASE_RPC_URL as string;
    case 'avalanche':
      return process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL as string;
    case 'bsc':
      return process.env.NEXT_PUBLIC_BSC_RPC_URL as string;
    case 'arbitrum':
      return process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL as string;
    default:
      throw new Error(`No RPC URL configured for chain ${chainKey}`);
  }
};

// Default contract (Ethereum Mainnet)
export const contract = getContractForChain('ethereum');

