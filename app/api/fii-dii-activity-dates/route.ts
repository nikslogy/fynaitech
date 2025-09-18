import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Make the actual API call to get FII/DII dates data
    const apiUrl = 'https://webapi.niftytrader.in/webapi/Resource/fii-dii-activity-dates'

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`External API error! status: ${response.status}`)
    }

    const data = await response.json()

    // Return the data as-is from the external API
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error fetching FII/DII dates data from external API:', error)
    return NextResponse.json(
      {
        result: 0,
        resultMessage: "Failed to fetch data from external API",
        resultData: {
          indices_data: [],
          months: [],
          year: []
        }
      },
      { status: 500 }
    )
  }
}
