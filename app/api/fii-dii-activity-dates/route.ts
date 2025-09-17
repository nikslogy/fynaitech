import { NextRequest, NextResponse } from 'next/server'

// Mock FII/DII dates data based on the API response structure from fii-dii-activity-dates.txt
const mockFIIDIIDatesData = {
  result: 1,
  resultMessage: "Success",
  resultData: {
    indices_data: [
      {
        symbol_name: "NIFTY 50",
        last_trade_price: 25330.25,
        created_at: "2025-09-17T00:00:00",
        change_value: 91.15,
        change_per: 0.36,
        fii_net_value: -1124.54,
        dii_net_value: 2293.53
      },
      {
        symbol_name: "NIFTY 50",
        last_trade_price: 25239.1,
        created_at: "2025-09-16T00:00:00",
        change_value: 169.9,
        change_per: 0.68,
        fii_net_value: 308.32,
        dii_net_value: 1518.73
      },
      {
        symbol_name: "NIFTY 50",
        last_trade_price: 25069.2,
        created_at: "2025-09-15T00:00:00",
        change_value: -44.8,
        change_per: -0.18,
        fii_net_value: -1268.59,
        dii_net_value: 1933.33
      },
      {
        symbol_name: "NIFTY 50",
        last_trade_price: 25114,
        created_at: "2025-09-12T00:00:00",
        change_value: 108.5,
        change_per: 0.43,
        fii_net_value: 129.58,
        dii_net_value: 1556.02
      },
      {
        symbol_name: "NIFTY 50",
        last_trade_price: 25005.5,
        created_at: "2025-09-11T00:00:00",
        change_value: 32.4,
        change_per: 0.13,
        fii_net_value: -3472.37,
        dii_net_value: 4045.54
      },
      {
        symbol_name: "NIFTY 50",
        last_trade_price: 24973.1,
        created_at: "2025-09-10T00:00:00",
        change_value: 104.5,
        change_per: 0.42,
        fii_net_value: -115.69,
        dii_net_value: 5004.29
      },
      {
        symbol_name: "NIFTY 50",
        last_trade_price: 24868.6,
        created_at: "2025-09-09T00:00:00",
        change_value: 95.45,
        change_per: 0.39,
        fii_net_value: 2050.46,
        dii_net_value: 83.08
      }
    ],
    months: [
      "2025-09",
      "2025-08",
      "2025-07",
      "2025-06",
      "2025-05",
      "2025-04",
      "2025-03",
      "2025-02",
      "2025-01",
      "2024-12",
      "2024-11",
      "2024-10"
    ],
    year: [
      "2025",
      "2024",
      "2023",
      "2022",
      "2021",
      "2020",
      "2019",
      "2018",
      "2017",
      "2016"
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data based on the real API structure
    // In production, this would call the actual external API
    const response = {
      result: 1,
      resultMessage: "Success",
      resultData: mockFIIDIIDatesData.resultData
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error in FII/DII dates API route:', error)
    return NextResponse.json(
      {
        result: 0,
        resultMessage: "Internal Server Error",
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
