import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestType = searchParams.get('request_type') || 'daily'
    const yearMonth = searchParams.get('year_month')

    // Build the external API URL
    const baseUrl = 'https://webapi.niftytrader.in/webapi/Resource/fii-dii-activity-data'
    const params = new URLSearchParams({
      request_type: requestType,
      ...(yearMonth && { year_month: yearMonth })
    })

    const apiUrl = `${baseUrl}?${params}`

    // Make the actual API call
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
    console.error('Error fetching FII/DII data from external API:', error)
    return NextResponse.json(
      {
        result: 0,
        resultMessage: "Failed to fetch data from external API",
        resultData: {
          fii_dii_data: [],
          fii_dii_summary_data: []
        }
      },
      { status: 500 }
    )
  }
}
