import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const ideogramApiKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY

  if (!ideogramApiKey) {
    return NextResponse.json({ error: 'Ideogram API key is not configured' }, { status: 500 })
  }

  try {
    const url = 'https://api.ideogram.ai/generate';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': ideogramApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_request: {
          prompt: prompt,
          aspect_ratio: "ASPECT_1_1",
          model: "V_2",
          magic_prompt_option: "AUTO"
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Ideogram API error:', errorData)
      return NextResponse.json({ error: `Ideogram API error: ${errorData.detail || 'Unknown error'}` }, { status: response.status })
    }

    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Unexpected response from Ideogram API:', data);
      return NextResponse.json({ error: 'Ideogram API did not return an image URL' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl: data.data[0].url })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}

