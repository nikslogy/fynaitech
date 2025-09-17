"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { fetchMaxPainIntradayChart, MaxPainIntradayData, getTrend, getStrength, formatNumber } from "@/lib/api"

const IndexCard = ({
  marketData,
  data,
  chartRange,
  onChartRangeChange,
}: {
  marketData: any
  data: any[]
  chartRange: number[]
  onChartRangeChange: (range: number[]) => void
}) => {
  const isPositive = marketData.change_value > 0
  const trend = getTrend(marketData.change_value)
  const strength = getStrength(marketData.change_per)
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  // Filter chart data based on selected range (start and end percentages)
  const filteredData = useMemo(() => {
    const startIndex = Math.floor(data.length * (chartRange[0] / 100))
    const endIndex = Math.ceil(data.length * (chartRange[1] / 100))
    return data.slice(startIndex, endIndex)
  }, [data, chartRange])

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
          {filteredData && filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={`chart-${marketData.symbol_name}`} data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${marketData.symbol_name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#4ade80" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? "#4ade80" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tickFormatter={(value) => formatNumber(value, 0)}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#4ade80" : "#ef4444"}
                  strokeWidth={2}
                  fill={`url(#gradient-${marketData.symbol_name})`}
                  dot={false}
                  activeDot={{ r: 3, fill: isPositive ? "#4ade80" : "#ef4444" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [formatNumber(value, 2), "Price"]}
                  labelFormatter={(label) => `Time: ${label}`}
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No chart data available
            </div>
          )}
        </div>
        {/* Time Range Slider */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">
              Time Range: {chartRange[0]}% - {chartRange[1]}%
            </Label>
            <span className="text-xs text-muted-foreground">
              {filteredData.length} data points
            </span>
          </div>
          <Slider
            value={chartRange}
            onValueChange={(value) => onChartRangeChange(value)}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start (9:15)</span>
            <span>End (15:30)</span>
          </div>
          {filteredData.length > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              Showing: {filteredData[0]?.time} to {filteredData[filteredData.length - 1]?.time}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Data Points</p>
            <p className="font-medium">{filteredData.length > 0 ? filteredData.length.toLocaleString() : "N/A"}</p>
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

const MarketOverview = ({ marketData }: { marketData: any }) => {
  const niftyData = marketData?.nifty ? {
    symbol_name: "NIFTY 50",
    last_trade_price: marketData.nifty.price,
    change_value: marketData.nifty.change,
    change_per: marketData.nifty.changePercent,
    high: marketData.nifty.high,
    low: marketData.nifty.low,
    high52: marketData.nifty.high52,
    max_pain: marketData.nifty.maxPain
  } : null

  const bankNiftyData = marketData?.bankNifty ? {
    symbol_name: "NIFTY BANK",
    last_trade_price: marketData.bankNifty.price,
    change_value: marketData.bankNifty.change,
    change_per: marketData.bankNifty.changePercent,
    high: marketData.bankNifty.high,
    low: marketData.bankNifty.low,
    max_pain: marketData.bankNifty.maxPain
  } : null

  // Calculate overall market sentiment based on major indices (NIFTY 50, NIFTY BANK)
  const majorIndices = [niftyData, bankNiftyData].filter(Boolean)

  const bullishCount = majorIndices.filter(item => item && item.change_per > 0).length
  const totalCount = majorIndices.length
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
            <p className="text-sm text-muted-foreground">Major Indices</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-bullish">{bullishCount}</span>
              <span className="text-sm text-muted-foreground">Up</span>
              <span className="text-lg font-bold text-bearish">{totalCount - bullishCount}</span>
              <span className="text-sm text-muted-foreground">Down</span>
            </div>
            <p className="text-xs text-muted-foreground">Out of {totalCount} major indices</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard({ marketData }: { marketData: any }) {
  const [niftyChartData, setNiftyChartData] = useState<any[]>([])
  const [bankNiftyChartData, setBankNiftyChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [niftyChartRange, setNiftyChartRange] = useState([0, 100]) // Start and end percentage of data to show for NIFTY
  const [bankNiftyChartRange, setBankNiftyChartRange] = useState([0, 100]) // Start and end percentage of data to show for BANKNIFTY

  // Process max pain intraday data for charts
  const processIntradayData = useMemo(() => {
    return (maxPainData: MaxPainIntradayData[]) => {
      if (!maxPainData.length) return []

      const firstEntry = maxPainData[0]
      const spotPrices = firstEntry.spot_price.split(',').map(price => parseFloat(price))
      const times = firstEntry.created_at.split(',')

      // Filter out invalid data points and ensure we have matching time and price arrays
      const validData = spotPrices
        .map((price, index) => {
          const timeStr = times[index]
          if (!timeStr || isNaN(price)) return null

          // Extract hour and minute from time string (HH:MM:SS format)
          const timeParts = timeStr.split(':')
          if (timeParts.length < 2) return null

          const hour = parseInt(timeParts[0])
          const minute = parseInt(timeParts[1])

          // Convert to minutes since market open (9:15 AM = 0 minutes)
          const minutesSinceOpen = (hour - 9) * 60 + (minute - 15)

          return {
            time: timeStr.substring(0, 5), // HH:MM format for display
            price: price,
            minutesSinceOpen: minutesSinceOpen,
            volume: 0,
            // Keep original timestamp for tooltip
            timestamp: timeStr
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null && item.minutesSinceOpen >= 0)
        .sort((a, b) => a.minutesSinceOpen - b.minutesSinceOpen)

      return validData
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch data for both NIFTY and BANKNIFTY separately
        const [niftyRawData, bankNiftyRawData] = await Promise.all([
          fetchMaxPainIntradayChart('nifty', 'nse'),
          fetchMaxPainIntradayChart('banknifty', 'nse')
        ])


        const processedNiftyData = processIntradayData(niftyRawData)
        const processedBankNiftyData = processIntradayData(bankNiftyRawData)

        setNiftyChartData(processedNiftyData)
        setBankNiftyChartData(processedBankNiftyData)
      } catch (err) {
        console.error('Error fetching intraday data:', err)
        setError('Failed to load intraday data')
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

  const niftyMarketData = marketData?.nifty ? {
    symbol_name: "NIFTY 50",
    last_trade_price: marketData.nifty.price,
    change_value: marketData.nifty.change,
    change_per: marketData.nifty.changePercent,
    high: marketData.nifty.high,
    low: marketData.nifty.low,
    high52: marketData.nifty.high52,
    max_pain: marketData.nifty.maxPain
  } : null

  const bankNiftyMarketData = marketData?.bankNifty ? {
    symbol_name: "NIFTY BANK",
    last_trade_price: marketData.bankNifty.price,
    change_value: marketData.bankNifty.change,
    change_per: marketData.bankNifty.changePercent,
    high: marketData.bankNifty.high,
    low: marketData.bankNifty.low,
    max_pain: marketData.bankNifty.maxPain
  } : null

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <MarketOverview marketData={marketData} />

      {/* Index Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {marketData?.nifty && niftyChartData && niftyChartData.length > 0 && (
          <IndexCard
            key="nifty-chart"
            marketData={{
              symbol_name: "NIFTY 50",
              last_trade_price: marketData.nifty.price,
              change_value: marketData.nifty.change,
              change_per: marketData.nifty.changePercent
            }}
            data={niftyChartData}
            chartRange={niftyChartRange}
            onChartRangeChange={setNiftyChartRange}
          />
        )}
        {marketData?.bankNifty && bankNiftyChartData && bankNiftyChartData.length > 0 && (
          <IndexCard
            key="banknifty-chart"
            marketData={{
              symbol_name: "NIFTY BANK",
              last_trade_price: marketData.bankNifty.price,
              change_value: marketData.bankNifty.change,
              change_per: marketData.bankNifty.changePercent
            }}
            data={bankNiftyChartData}
            chartRange={bankNiftyChartRange}
            onChartRangeChange={setBankNiftyChartRange}
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
                {niftyMarketData ? formatNumber(niftyMarketData.high, 0) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Day Low</p>
              <p className="text-lg font-bold text-bearish">
                {niftyMarketData ? formatNumber(niftyMarketData.low, 0) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Max Pain</p>
              <p className="text-lg font-bold">
                {niftyMarketData ? formatNumber(niftyMarketData.max_pain, 0) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">52W High</p>
              <p className="text-lg font-bold text-bullish">
                {niftyMarketData ? formatNumber(niftyMarketData.high52, 0) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
