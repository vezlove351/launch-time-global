'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'
import { getContractForChain, ChainKey } from "@/app/client"
import { prepareContractCall } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"
import { ethers } from 'ethers'

interface TokenDetails {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
}

interface TokenCreationFormProps {
  onTokenCreated: (tokenDetails: TokenDetails) => void;
  onFormChange: (tokenDetails: TokenDetails) => void;
  initialTokenDetails: TokenDetails;
  selectedNetwork: {
    name: string;
    id: string;
    networkId: string;
  };
  creationFee: string;
  fundingTarget: string;
}

export default function TokenCreationForm({ 
  onTokenCreated, 
  onFormChange, 
  initialTokenDetails, 
  selectedNetwork,
  creationFee,
  fundingTarget
}: TokenCreationFormProps) {
  const [formData, setFormData] = useState<TokenDetails>(initialTokenDetails)
  const [isLoading, setIsLoading] = useState(false)
  const [useAIGeneration, setUseAIGeneration] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const { toast } = useToast()
  const router = useRouter()
  const { mutate: sendTransaction } = useSendTransaction()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updatedFormData = {
      ...formData,
      [name]: value
    }
    setFormData(updatedFormData)
    onFormChange(updatedFormData)
  }

  const generateImage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }
      
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl)
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }))
        onFormChange({ ...formData, imageUrl: data.imageUrl })
        toast({
          title: "Success",
          description: "Image generated successfully!",
        })
      } else {
        throw new Error('No image URL returned from the API')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const imageUrlToUse = useAIGeneration ? generatedImageUrl : formData.imageUrl
      const contract = getContractForChain(selectedNetwork.networkId.toLowerCase() as ChainKey)
      
      const transaction = prepareContractCall({
        contract,
        method: "function createMemeToken(string name, string symbol, string imageUrl, string description) payable returns (address)",
        params: [formData.name, formData.symbol, imageUrlToUse, formData.description],
        value: ethers.parseEther(creationFee.split(' ')[0]),
      })

      sendTransaction(transaction, {
        onSuccess: (result) => {
          toast({
            title: "MemeToken Created!",
            description: `Transaction Hash: ${result.transactionHash}`,
          })
          // Notify parent component
          onTokenCreated({ ...formData, imageUrl: imageUrlToUse })
          // Reset form
          const resetFormData = { name: '', symbol: '', description: '', imageUrl: '' }
          setFormData(resetFormData)
          onFormChange(resetFormData)
          setAiPrompt('')
          setGeneratedImageUrl('')
          
          // Redirect to home page
          router.push('/')
        },
        onError: (error) => {
          console.error('Error creating token:', error)
          toast({
            title: "Error",
            description: `Failed to create MemeToken. Please ensure you have enough ${creationFee.split(' ')[1]} to cover the creation fee and gas costs.`,
            variant: "destructive",
          })
        },
      })
    } catch (error) {
      console.error('Error creating token:', error)
      toast({
        title: "Error",
        description: `Failed to create MemeToken. Please ensure you have enough ${creationFee.split(' ')[1]} to cover the creation fee and gas costs.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Token Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter token name"
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          required
        />
      </div>
      <div>
        <Label htmlFor="symbol" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Token Symbol</Label>
        <Input
          id="symbol"
          name="symbol"
          value={formData.symbol}
          onChange={handleChange}
          placeholder="Enter token symbol"
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          required
        />
      </div>
      <div>
        <Label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter token description"
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="use-ai"
          checked={useAIGeneration}
          onCheckedChange={setUseAIGeneration}
        />
        <Label htmlFor="use-ai" className="text-gray-900 dark:text-white">Use AI Image Generation</Label>
      </div>
      {useAIGeneration ? (
        <div>
          <Label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">AI Image Prompt</Label>
          <div className="flex space-x-2">
            <Input
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the image you want to generate"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 flex-grow"
            />
            <Button 
              type="button" 
              onClick={generateImage}
              disabled={isLoading || !aiPrompt}
              className="bg-[#4F46E5] hover:bg-[#4F46E5]/90"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="imageUrl" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Enter image URL"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            required={!useAIGeneration}
          />
        </div>
      )}
     
      <Button 
        type="submit" 
        className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-lg text-white py-6 mt-8 rounded-full"
        disabled={isLoading || (useAIGeneration && !generatedImageUrl)}
      >
        {isLoading ? 'Creating Token...' : `Create Token on ${selectedNetwork.name}`}
      </Button>
    </form>
  )
}

