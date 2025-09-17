import { NextRequest, NextResponse } from 'next/server'

// Mock FII/DII data based on the API response structure from fii-dii-activity-data1.txt and fii-dii-activity-data2.txt
const mockFIIDIIData = {
  result: 1,
  resultMessage: "Success",
  resultData: {
    fii_dii_data: [
      {
        created_at: "2025-09-17T00:00:00",
        fii_buy_value: 0,
        fii_sell_value: 0,
        fii_net_value: -1124.54,
        dii_buy_value: 0,
        dii_sell_value: 0,
        dii_net_value: 2293.53,
        symbol_name: "NIFTY 50",
        last_trade_price: 25330.25,
        change_value: 91.15,
        change_per: 0.36
      },
      {
        created_at: "2025-09-16T00:00:00",
        fii_buy_value: 0,
        fii_sell_value: 0,
        fii_net_value: 308.32,
        dii_buy_value: 0,
        dii_sell_value: 0,
        dii_net_value: 1518.73,
        symbol_name: "NIFTY 50",
        last_trade_price: 25239.1,
        change_value: 169.9,
        change_per: 0.68
      },
      {
        created_at: "2025-09-15T00:00:00",
        fii_buy_value: 8169.16,
        fii_sell_value: 9437.75,
        fii_net_value: -1268.59,
        dii_buy_value: 10173.17,
        dii_sell_value: 8239.84,
        dii_net_value: 1933.33,
        symbol_name: "NIFTY 50",
        last_trade_price: 25069.2,
        change_value: -44.8,
        change_per: -0.18
      },
      {
        created_at: "2025-09-12T00:00:00",
        fii_buy_value: 11094.18,
        fii_sell_value: 10964.6,
        fii_net_value: 129.58,
        dii_buy_value: 11675.26,
        dii_sell_value: 10119.24,
        dii_net_value: 1556.02,
        symbol_name: "NIFTY 50",
        last_trade_price: 25114,
        change_value: 108.5,
        change_per: 0.43
      },
      {
        created_at: "2025-09-11T00:00:00",
        fii_buy_value: 10008.75,
        fii_sell_value: 13481.12,
        fii_net_value: -3472.37,
        dii_buy_value: 14831.21,
        dii_sell_value: 10785.67,
        dii_net_value: 4045.54,
        symbol_name: "NIFTY 50",
        last_trade_price: 25005.5,
        change_value: 32.4,
        change_per: 0.13
      },
      {
        created_at: "2025-09-10T00:00:00",
        fii_buy_value: 12603.53,
        fii_sell_value: 12719.22,
        fii_net_value: -115.69,
        dii_buy_value: 16276.75,
        dii_sell_value: 11272.46,
        dii_net_value: 5004.29,
        symbol_name: "NIFTY 50",
        last_trade_price: 24973.1,
        change_value: 104.5,
        change_per: 0.42
      },
      {
        created_at: "2025-09-09T00:00:00",
        fii_buy_value: 11896.67,
        fii_sell_value: 9846.21,
        fii_net_value: 2050.46,
        dii_buy_value: 10422.84,
        dii_sell_value: 10339.76,
        dii_net_value: 83.08,
        symbol_name: "NIFTY 50",
        last_trade_price: 24868.6,
        change_value: 95.45,
        change_per: 0.39
      },
      {
        created_at: "2025-09-08T00:00:00",
        fii_buy_value: 8228.52,
        fii_sell_value: 10398.87,
        fii_net_value: -2170.35,
        dii_buy_value: 11080.7,
        dii_sell_value: 8066.4,
        dii_net_value: 3014.3,
        symbol_name: "NIFTY 50",
        last_trade_price: 24773.15,
        change_value: 32.15,
        change_per: 0.13
      },
      {
        created_at: "2025-09-05T00:00:00",
        fii_buy_value: 8096.45,
        fii_sell_value: 9401.36,
        fii_net_value: -1304.91,
        dii_buy_value: 10633.48,
        dii_sell_value: 8812.25,
        dii_net_value: 1821.23,
        symbol_name: "NIFTY 50",
        last_trade_price: 24741,
        change_value: 6.7,
        change_per: 0.03
      },
      {
        created_at: "2025-09-04T00:00:00",
        fii_buy_value: 12262.84,
        fii_sell_value: 12369.18,
        fii_net_value: -106.34,
        dii_buy_value: 16588.04,
        dii_sell_value: 14354.95,
        dii_net_value: 2233.09,
        symbol_name: "NIFTY 50",
        last_trade_price: 24734.3,
        change_value: 19.25,
        change_per: 0.08
      }
    ],
    fii_dii_summary_data: [
      {
        month: "2025-09",
        created_at: "2025-09-15T00:00:00",
        fii_buy_value: 111624.09,
        fii_sell_value: 122137.95,
        fii_net_value: -10513.86,
        dii_buy_value: 142734.52,
        dii_sell_value: 113653.87,
        dii_net_value: 29080.65,
        symbol_name: "NIFTY 50",
        last_trade_price: 25069.2,
        change_value: -44.8,
        change_per: -0.18
      },
      {
        month: "2025-08",
        created_at: "2025-08-29T00:00:00",
        fii_buy_value: 268077.36,
        fii_sell_value: 314980.28,
        fii_net_value: -46902.92,
        dii_buy_value: 293563.09,
        dii_sell_value: 198734.54,
        dii_net_value: 94828.55,
        symbol_name: "NIFTY 50",
        last_trade_price: 24426.85,
        change_value: -74.05,
        change_per: -0.3
      },
      {
        month: "2025-07",
        created_at: "2025-07-31T00:00:00",
        fii_buy_value: 284138.54,
        fii_sell_value: 331805.22,
        fii_net_value: -47666.68,
        dii_buy_value: 321827.75,
        dii_sell_value: 260888.59,
        dii_net_value: 60939.16,
        symbol_name: "NIFTY 50",
        last_trade_price: 24768.35,
        change_value: -86.7,
        change_per: -0.35
      },
      {
        month: "2025-06",
        created_at: "2025-06-30T00:00:00",
        fii_buy_value: 349580.23,
        fii_sell_value: 342091.25,
        fii_net_value: 7488.98,
        dii_buy_value: 350402.34,
        dii_sell_value: 277728.43,
        dii_net_value: 72673.91,
        symbol_name: "NIFTY 50",
        last_trade_price: 25517.05,
        change_value: -120.75,
        change_per: -0.47
      },
      {
        month: "2025-05",
        created_at: "2025-05-30T00:00:00",
        fii_buy_value: 351188.38,
        fii_sell_value: 339415.13,
        fii_net_value: 11773.25,
        dii_buy_value: 298232.5,
        dii_sell_value: 230590.16,
        dii_net_value: 67642.34,
        symbol_name: "NIFTY 50",
        last_trade_price: 24750.7,
        change_value: -82.9,
        change_per: -0.33
      },
      {
        month: "2025-04",
        created_at: "2025-04-30T00:00:00",
        fii_buy_value: 299966.45,
        fii_sell_value: 297231.43,
        fii_net_value: 2735.02,
        dii_buy_value: 273363.93,
        dii_sell_value: 245135.48,
        dii_net_value: 28228.45,
        symbol_name: "NIFTY 50",
        last_trade_price: 24334.2,
        change_value: -1.75,
        change_per: -0.01
      }
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestType = searchParams.get('request_type') || 'daily'
    const yearMonth = searchParams.get('year_month')

    // For now, return mock data based on the real API structure
    // In production, this would call the actual external API
    const response = {
      result: 1,
      resultMessage: "Success",
      resultData: mockFIIDIIData.resultData
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error in FII/DII API route:', error)
    return NextResponse.json(
      {
        result: 0,
        resultMessage: "Internal Server Error",
        resultData: {
          fii_dii_data: [],
          fii_dii_summary_data: []
        }
      },
      { status: 500 }
    )
  }
}
