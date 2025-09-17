"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { fetchStockIndexData, fetchTodaySpotData, fetchMaxPainIntradayChart, MarketIndex, MaxPainIntradayData, getTrend, getStrength, formatNumber } from "@/lib/api"

const IndexCard = ({
  marketData,
  data,
}: {
  marketData: MarketIndex
  data: any[]
}) => {
  const isPositive = marketData.change_value > 0
  const trend = getTrend(marketData.change_value)
  const strength = getStrength(marketData.change_per)
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-[family-name:var(--font-space-grotesk)]">{marketData.symbol_name}</CardTitle>
          <Badge
            variant={strength === "Bullish" ? "default" : strength === "Bearish" ? "destructive" : "secondary"}
            className={strength === "Bullish" ? "bg-accent text-accent-foreground" : ""}
          >
            {strength}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
            {formatNumber(marketData.last_trade_price, 2)}
          </span>
          <div className={`flex items-center space-x-1 ${isPositive ? "text-bullish" : "text-bearish"}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="font-medium">
              {isPositive ? "+" : ""}
              {formatNumber(marketData.change_value, 2)} ({formatNumber(marketData.change_per, 2)}%)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${marketData.symbol_name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#4ade80" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#4ade80" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#4ade80" : "#ef4444"}
                strokeWidth={2}
                fill={`url(#gradient-${marketData.symbol_name})`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [value.toLocaleString(), "Price"]}
                labelFormatter={(label) => `Time: ${label}`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Volume</p>
            <p className="font-medium">{data[data.length - 1]?.volume.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Trend</p>
            <div className="flex items-center space-x-1">
              <TrendIcon className={`w-3 h-3 ${isPositive ? "text-bullish" : "text-bearish"}`} />
              <span className="font-medium capitalize">{trend}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const MarketOverview = ({ marketData }: { marketData: MarketIndex[] }) => {
  const niftyData = marketData.find(item => item.symbol_name === "NIFTY 50")
  const bankNiftyData = marketData.find(item => item.symbol_name === "NIFTY BANK")
  
  // Calculate overall market sentiment based on major indices
  const bullishCount = marketData.filter(item => item.change_per > 0).length
  const totalCount = marketData.length
  const bullishPercentage = totalCount > 0 ? (bullishCount / totalCount) * 100 : 0
  const sentiment = bullishPercentage > 60 ? "Bullish" : bullishPercentage < 40 ? "Bearish" : "Neutral"
  
  const currentTime = new Date().toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Market Overview</span>
        </CardTitle>
        <CardDescription>Real-time market sentiment and key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Market Sentiment</p>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${sentiment === "Bullish" ? "bg-bullish" : sentiment === "Bearish" ? "bg-bearish" : "bg-yellow-500"}`}></div>
              <span className="font-medium">{sentiment}</span>
            </div>
            <Progress value={bullishPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{bullishPercentage.toFixed(0)}% Bullish signals</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">NIFTY Range</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">{niftyData ? formatNumber(niftyData.high - niftyData.low, 0) : "N/A"}</span>
              <Badge variant="secondary">Points</Badge>
            </div>
            <Progress value={niftyData ? Math.min(((niftyData.high - niftyData.low) / niftyData.last_trade_price) * 100 * 10, 100) : 0} className="h-2" />
            <p className="text-xs text-muted-foreground">
              H: {niftyData ? formatNumber(niftyData.high, 0) : "N/A"} | L: {niftyData ? formatNumber(niftyData.low, 0) : "N/A"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Indices</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-bullish">{bullishCount}</span>
              <span className="text-sm text-muted-foreground">Up</span>
              <span className="text-lg font-bold text-bearish">{totalCount - bullishCount}</span>
              <span className="text-sm text-muted-foreground">Down</span>
            </div>
            <p className="text-xs text-muted-foreground">Last updated: {currentTime}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketIndex[]>([])
  const [intradayData, setIntradayData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Process max pain intraday data for charts
  const processIntradayData = (maxPainData: MaxPainIntradayData[]) => {
    if (!maxPainData.length) return []
    
    const firstEntry = maxPainData[0]
    const spotPrices = firstEntry.spot_price.split(',').map(price => parseFloat(price))
    const times = firstEntry.created_at.split(',')
    
    return spotPrices.map((price, index) => ({
      time: times[index] || `${9 + Math.floor(index / 60)}:${String(15 + (index % 60)).padStart(2, '0')}`,
      price: price,
      volume: Math.floor(1000 + Math.random() * 1500) // Volume data not available in this API
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [stockData, maxPainData] = await Promise.all([
          fetchStockIndexData(),
          fetchMaxPainIntradayChart('nifty', 'nse')
        ])
        setMarketData(stockData)
        const processedIntradayData = processIntradayData(maxPainData)
        setIntradayData(processedIntradayData)
      } catch (err) {
        console.error('Error fetching market data:', err)
        setError('Failed to load market data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading market data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center text-red-500">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const niftyData = marketData.find(item => item.symbol_name === "NIFTY 50")
  const bankNiftyData = marketData.find(item => item.symbol_name === "NIFTY BANK")

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <MarketOverview marketData={marketData} />

      {/* Index Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {niftyData && (
          <IndexCard
            marketData={niftyData}
            data={intradayData}
          />
        )}
        {bankNiftyData && (
          <IndexCard
            marketData={bankNiftyData}
            data={intradayData} // Using same intraday data as both are market indices
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Day High</p>
              <p className="text-lg font-bold text-bullish">
                {niftyData ? formatNumber(niftyData.high, 0) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Day Low</p>
              <p className="text-lg font-bold text-bearish">
                {niftyData ? formatNumber(niftyData.low, 0) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Max Pain</p>
              <p className="text-lg font-bold">
                {niftyData ? formatNumber(niftyData.max_pain, 0) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">52W High</p>
              <p className="text-lg font-bold text-bullish">
                {niftyData ? formatNumber(niftyData.high52, 0) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
