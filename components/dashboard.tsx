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

const MarketOverview = ({ marketData, additionalIndices }: {
  marketData: any,
  additionalIndices?: any[]
}) => {
  const niftyData = marketData?.nifty ? {
    symbol_name: "NIFTY 50",
    last_trade_price: marketData.nifty.price,
    change_value: marketData.nifty.change,
    change_per: marketData.nifty.changePercent,
    high: marketData.nifty.high,
    low: marketData.nifty.low,
    high52: marketData.nifty.high52,
    low52: marketData.nifty.low52,
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

  // Combine all available indices for comprehensive analysis
  const allIndices = [
    niftyData,
    bankNiftyData,
    ...(additionalIndices || [])
  ].filter(Boolean)

  // Market Sentiment Analysis
  const bullishCount = allIndices.filter(item => item && item.change_per > 0).length
  const bearishCount = allIndices.filter(item => item && item.change_per < 0).length
  const neutralCount = allIndices.filter(item => item && item.change_per === 0).length
  const totalIndices = allIndices.length
  const bullishPercentage = totalIndices > 0 ? (bullishCount / totalIndices) * 100 : 0

  const getMarketSentiment = () => {
    if (bullishPercentage >= 70) return { status: "Strong Bullish", color: "bg-green-500", textColor: "text-green-600" }
    if (bullishPercentage >= 60) return { status: "Bullish", color: "bg-green-400", textColor: "text-green-600" }
    if (bullishPercentage >= 40) return { status: "Neutral", color: "bg-yellow-500", textColor: "text-yellow-600" }
    if (bullishPercentage >= 30) return { status: "Bearish", color: "bg-red-400", textColor: "text-red-600" }
    return { status: "Strong Bearish", color: "bg-red-500", textColor: "text-red-600" }
  }

  const sentiment = getMarketSentiment()

  // Volatility Analysis
  const calculateVolatility = () => {
    if (!niftyData || !niftyData.high || !niftyData.low || !niftyData.last_trade_price) return null

    const dailyRange = niftyData.high - niftyData.low
    const volatilityPercent = (dailyRange / niftyData.last_trade_price) * 100
    const volatilityScore = Math.min(volatilityPercent * 10, 100) // Scale for progress bar

    let volatilityLevel = "Low"
    if (volatilityPercent > 2.5) volatilityLevel = "High"
    else if (volatilityPercent > 1.5) volatilityLevel = "Medium"

    return {
      range: dailyRange,
      percentage: volatilityPercent,
      level: volatilityLevel,
      score: volatilityScore
    }
  }

  const volatility = calculateVolatility()

  // Sector Performance Analysis
  const sectorAnalysis = () => {
    const sectors = []

    // Large Cap (NIFTY 50)
    if (niftyData) {
      sectors.push({
        name: "Large Cap",
        change: niftyData.change_per,
        weight: 60 // NIFTY 50 represents ~60% of market cap
      })
    }

    // Banking Sector (NIFTY BANK)
    if (bankNiftyData) {
      sectors.push({
        name: "Banking",
        change: bankNiftyData.change_per,
        weight: 25 // Banking sector weight
      })
    }

    // Mid Cap (if available from additionalIndices)
    const midCapIndex = additionalIndices?.find(idx => idx.symbol_name?.includes("MID"))
    if (midCapIndex) {
      sectors.push({
        name: "Mid Cap",
        change: midCapIndex.change_per,
        weight: 15
      })
    }

    return sectors
  }

  const sectors = sectorAnalysis()

  // 52-Week Analysis for NIFTY
  const week52Analysis = () => {
    if (!niftyData || !niftyData.high52 || !niftyData.low52) return null

    const currentPrice = niftyData.last_trade_price
    const yearHigh = niftyData.high52
    const yearLow = niftyData.low52

    const distanceFromHigh = ((yearHigh - currentPrice) / yearHigh) * 100
    const distanceFromLow = ((currentPrice - yearLow) / yearLow) * 100

    return {
      distanceFromHigh: distanceFromHigh,
      distanceFromLow: distanceFromLow,
      position: distanceFromHigh < 10 ? "Near 52W High" :
               distanceFromLow < 10 ? "Near 52W Low" : "Mid Range"
    }
  }

  const week52 = week52Analysis()

  // Market Breadth Calculation
  const marketBreadth = () => {
    const advances = bullishCount
    const declines = bearishCount
    const unchanged = neutralCount

    const breadthRatio = declines > 0 ? advances / declines : advances
    const breadthScore = Math.min(Math.abs(breadthRatio) * 50, 100)

    return {
      advances,
      declines,
      unchanged,
      ratio: breadthRatio.toFixed(2),
      score: breadthScore,
      status: breadthRatio > 1.5 ? "Strong Breadth" :
              breadthRatio > 1 ? "Positive Breadth" :
              breadthRatio > 0.7 ? "Mixed Breadth" :
              breadthRatio > 0.5 ? "Weak Breadth" : "Poor Breadth"
    }
  }

  const breadth = marketBreadth()

  // Detailed index analysis
  const detailedIndexAnalysis = () => {
    const indices = [
      ...allIndices,
      ...(additionalIndices || [])
    ].filter((index, indexPos, arr) =>
      arr.findIndex(i => i.symbol_name === index.symbol_name) === indexPos
    ) // Remove duplicates

    const categorizedIndices = {
      largeCap: indices.filter(idx => idx.symbol_name?.includes('NIFTY 50')),
      bankNifty: indices.filter(idx => idx.symbol_name?.includes('NIFTY BANK')),
      finService: indices.filter(idx => idx.symbol_name?.includes('NIFTY FIN SERVICE')),
      midCap: indices.filter(idx => idx.symbol_name?.includes('NIFTY MID SELECT')),
      sensex: indices.filter(idx => idx.symbol_name?.includes('SENSEX')),
      giftNifty: indices.filter(idx => idx.symbol_name?.includes('GIFT NIFTY')),
      others: indices.filter(idx =>
        !idx.symbol_name?.includes('NIFTY 50') &&
        !idx.symbol_name?.includes('NIFTY BANK') &&
        !idx.symbol_name?.includes('NIFTY FIN SERVICE') &&
        !idx.symbol_name?.includes('NIFTY MID SELECT') &&
        !idx.symbol_name?.includes('SENSEX') &&
        !idx.symbol_name?.includes('GIFT NIFTY')
      )
    }

    return categorizedIndices
  }

  const categorizedIndices = detailedIndexAnalysis()

  return (
    <div className="space-y-6">
      {/* Main Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Market Overview</span>
          </CardTitle>
          <CardDescription>Real-time market sentiment and comprehensive index analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Market Sentiment */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                  <Badge variant={sentiment.status === "Strong Bullish" || sentiment.status === "Bullish" ? "default" :
                               sentiment.status === "Strong Bearish" || sentiment.status === "Bearish" ? "destructive" : "secondary"}
                         className="text-xs">
                    {sentiment.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${sentiment.color}`}></div>
                  <span className="font-medium">{bullishPercentage.toFixed(0)}% Bullish</span>
                </div>
                <Progress value={bullishPercentage} className="h-2" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Advances: {breadth.advances}</span>
                    <span className="text-green-600">↑</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Declines: {breadth.declines}</span>
                    <span className="text-red-600">↓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unchanged: {breadth.unchanged}</span>
                    <span className="text-gray-600">→</span>
                  </div>
                </div>
              </div>

              {/* Volatility Analysis */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Market Volatility</p>
                {volatility ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{formatNumber(volatility.range, 0)}</span>
                      <Badge variant="secondary" className="text-xs">{volatility.level}</Badge>
                    </div>
                    <Progress value={volatility.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {volatility.percentage.toFixed(2)}% daily range
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>High: {formatNumber(niftyData?.high || 0, 0)}</div>
                      <div>Low: {formatNumber(niftyData?.low || 0, 0)}</div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Data unavailable</p>
                )}
              </div>

              {/* 52-Week Analysis */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">52-Week Position</p>
                {week52 ? (
                  <>
                    <div className="text-lg font-bold">{week52.position}</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>From High:</span>
                        <span className={week52.distanceFromHigh < 5 ? "text-red-600" : "text-muted-foreground"}>
                          {week52.distanceFromHigh.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>From Low:</span>
                        <span className={week52.distanceFromLow < 5 ? "text-green-600" : "text-muted-foreground"}>
                          {week52.distanceFromLow.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      NIFTY 52W Range: {formatNumber(niftyData?.low52 || 0, 0)} - {formatNumber(niftyData?.high52 || 0, 0)}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Data unavailable</p>
                )}
              </div>

              {/* Market Breadth */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Market Breadth</p>
                <div className="text-lg font-bold">{breadth.status}</div>
                <Progress value={breadth.score} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  A/D Ratio: {breadth.ratio}
                </p>
                <div className="text-xs text-muted-foreground">
                  Total Indices: {totalIndices}
                </div>
              </div>
            </div>

            {/* Major Indices Performance */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Major Indices Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* NIFTY 50 */}
                {categorizedIndices.largeCap.map((index, idx) => (
                  <div key={`largecap-${idx}`} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium">NIFTY 50</h5>
                      <Badge variant={index.change_per > 0 ? "default" : index.change_per < 0 ? "destructive" : "secondary"}
                             className="text-xs">
                        {index.change_per > 0 ? "↑" : index.change_per < 0 ? "↓" : "→"} {Math.abs(index.change_per).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold">{formatNumber(index.last_trade_price, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={`font-medium ${index.change_value > 0 ? 'text-green-600' : index.change_value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {index.change_value > 0 ? '+' : ''}{formatNumber(index.change_value, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="text-xs">{formatNumber(index.low, 0)} - {formatNumber(index.high, 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* NIFTY BANK */}
                {categorizedIndices.bankNifty.map((index, idx) => (
                  <div key={`banknifty-${idx}`} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium">NIFTY BANK</h5>
                      <Badge variant={index.change_per > 0 ? "default" : index.change_per < 0 ? "destructive" : "secondary"}
                             className="text-xs">
                        {index.change_per > 0 ? "↑" : index.change_per < 0 ? "↓" : "→"} {Math.abs(index.change_per).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold">{formatNumber(index.last_trade_price, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={`font-medium ${index.change_value > 0 ? 'text-green-600' : index.change_value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {index.change_value > 0 ? '+' : ''}{formatNumber(index.change_value, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="text-xs">{formatNumber(index.low, 0)} - {formatNumber(index.high, 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* NIFTY FIN SERVICE */}
                {categorizedIndices.finService.map((index, idx) => (
                  <div key={`finservice-${idx}`} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium">NIFTY FIN SERVICE</h5>
                      <Badge variant={index.change_per > 0 ? "default" : index.change_per < 0 ? "destructive" : "secondary"}
                             className="text-xs">
                        {index.change_per > 0 ? "↑" : index.change_per < 0 ? "↓" : "→"} {Math.abs(index.change_per).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold">{formatNumber(index.last_trade_price, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={`font-medium ${index.change_value > 0 ? 'text-green-600' : index.change_value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {index.change_value > 0 ? '+' : ''}{formatNumber(index.change_value, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="text-xs">{formatNumber(index.low, 0)} - {formatNumber(index.high, 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* NIFTY MID SELECT */}
                {categorizedIndices.midCap.map((index, idx) => (
                  <div key={`midcap-${idx}`} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium">NIFTY MID SELECT</h5>
                      <Badge variant={index.change_per > 0 ? "default" : index.change_per < 0 ? "destructive" : "secondary"}
                             className="text-xs">
                        {index.change_per > 0 ? "↑" : index.change_per < 0 ? "↓" : "→"} {Math.abs(index.change_per).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold">{formatNumber(index.last_trade_price, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={`font-medium ${index.change_value > 0 ? 'text-green-600' : index.change_value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {index.change_value > 0 ? '+' : ''}{formatNumber(index.change_value, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="text-xs">{formatNumber(index.low, 0)} - {formatNumber(index.high, 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* SENSEX */}
                {categorizedIndices.sensex.map((index, idx) => (
                  <div key={`sensex-${idx}`} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium">SENSEX</h5>
                      <Badge variant={index.change_per > 0 ? "default" : index.change_per < 0 ? "destructive" : "secondary"}
                             className="text-xs">
                        {index.change_per > 0 ? "↑" : index.change_per < 0 ? "↓" : "→"} {Math.abs(index.change_per).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold">{formatNumber(index.last_trade_price, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={`font-medium ${index.change_value > 0 ? 'text-green-600' : index.change_value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {index.change_value > 0 ? '+' : ''}{formatNumber(index.change_value, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="text-xs">{formatNumber(index.low, 0)} - {formatNumber(index.high, 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* GIFT NIFTY */}
                {categorizedIndices.giftNifty.map((index, idx) => (
                  <div key={`giftnifty-${idx}`} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium">GIFT NIFTY</h5>
                      <Badge variant={index.change_per > 0 ? "default" : index.change_per < 0 ? "destructive" : "secondary"}
                             className="text-xs">
                        {index.change_per > 0 ? "↑" : index.change_per < 0 ? "↓" : "→"} {Math.abs(index.change_per).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold">{formatNumber(index.last_trade_price, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={`font-medium ${index.change_value > 0 ? 'text-green-600' : index.change_value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {index.change_value > 0 ? '+' : ''}{formatNumber(index.change_value, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="text-xs">{formatNumber(index.low, 0)} - {formatNumber(index.high, 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{breadth.advances}</p>
                <p className="text-xs text-muted-foreground">Advancing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{breadth.declines}</p>
                <p className="text-xs text-muted-foreground">Declining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{breadth.unchanged}</p>
                <p className="text-xs text-muted-foreground">Unchanged</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{totalIndices}</p>
                <p className="text-xs text-muted-foreground">Total Indices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard({ marketData }: { marketData: any }) {
  const [niftyChartData, setNiftyChartData] = useState<any[]>([])
  const [bankNiftyChartData, setBankNiftyChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [niftyChartRange, setNiftyChartRange] = useState([0, 100]) // Start and end percentage of data to show for NIFTY
  const [bankNiftyChartRange, setBankNiftyChartRange] = useState([0, 100]) // Start and end percentage of data to show for BANKNIFTY
  const [additionalIndices, setAdditionalIndices] = useState<any[]>([])

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

  // Fetch additional stock index data for comprehensive market overview
  const fetchStockIndexData = async () => {
    try {
      const response = await fetch('/api/stock-index-data')
      if (response.ok) {
        const data = await response.json()
        if (data.resultData && Array.isArray(data.resultData)) {
          // Filter out NIFTY 50 and NIFTY BANK as they're already in marketData
          const additional = data.resultData.filter(
            (index: any) =>
              index.symbol_name !== 'NIFTY 50' &&
              index.symbol_name !== 'NIFTY BANK'
          )
          setAdditionalIndices(additional)
        }
      }
    } catch (err) {
      console.error('Error fetching stock index data:', err)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch additional stock index data for market overview
        await fetchStockIndexData()

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
      <MarketOverview marketData={marketData} additionalIndices={additionalIndices} />

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
