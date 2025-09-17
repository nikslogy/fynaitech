import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'nifty'
    const createdAt = searchParams.get('created_at') || ''

    // Make actual API call to external service
    const externalApiUrl = `https://webapi.niftytrader.in/webapi/symbol/today-spot-data?symbol=${symbol}&created_at=${createdAt}`

    console.log('Making real API call to:', externalApiUrl)

    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Don't cache this request
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('External API call failed:', response.status, response.statusText)
      throw new Error(`External API call failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received real data from external API:', data.resultMessage)

    // Return the real data from external API
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error in today spot data API route:', error)
    return NextResponse.json(
      {
        result: 0,
        resultMessage: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        resultData: null
      },
      { status: 500 }
    )
  }
}