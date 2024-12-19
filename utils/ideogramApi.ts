const IDEOGRAM_API_URL = 'https://api.ideogram.ai/generate';

interface IdeogramApiRequest {
  image_request: {
    prompt: string;
    aspect_ratio?: 'ASPECT_1_1' | 'ASPECT_4_3' | 'ASPECT_3_4' | 'ASPECT_16_9' | 'ASPECT_9_16' | 'ASPECT_10_16';
    model?: 'V_1' | 'V_1_TURBO' | 'V_2' | 'V_2_TURBO';
    magic_prompt_option?: 'AUTO' | 'ON' | 'OFF';
    seed?: number;
    style_type?: 'PHOTO' | 'ILLUSTRATION' | 'ANIME' | 'DIGITAL_ART' | 'COMIC' | 'SKETCH' | 'GENERAL';
    negative_prompt?: string;
    num_images?: number;
    resolution?: string;
  };
}

interface IdeogramApiResponse {
  created: string;
  data: Array<{
    prompt: string;
    resolution: string;
    is_image_safe: boolean;
    seed: number;
    url: string;
    style_type: string;
  }>;
}

export async function generateImageWithIdeogram(prompt: string, options: Partial<IdeogramApiRequest['image_request']> = {}): Promise<string> {
  const requestData: IdeogramApiRequest = {
    image_request: {
      prompt,
      aspect_ratio: 'ASPECT_1_1',
      model: 'V_2',
      magic_prompt_option: 'AUTO',
      ...options,
    },
  };

  try {
    const response = await fetch(IDEOGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Api-Key': process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: IdeogramApiResponse = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].url;
    } else {
      throw new Error('No image generated in the response');
    }
  } catch (error) {
    console.error('Error generating image with Ideogram:', error);
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the Ideogram API. Please check your internet connection and try again.');
      }
      throw new Error(`Ideogram API error: ${error.message}`);
    } else {
      throw new Error('An unexpected error occurred while generating the image');
    }
  }
}

