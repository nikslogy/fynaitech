"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Calculator, ArrowLeft, Activity, ZoomIn, ZoomOut, BarChart3, RefreshCw, Zap } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, ComposedChart } from "recharts"
import { Slider } from "@/components/ui/slider"
import { fetchMaxPainIntradayChart, MaxPainIntradayData } from "@/lib/api"

export default function GannStrategyLivePage() {
  const [strategyData, setStrategyData] = useState<any>(null)
  const [intradayData, setIntradayData] = useState<MaxPainIntradayData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartMode, setChartMode] = useState<'full' | 'zoomed'>('full')
  const [timeFilter, setTimeFilter] = useState<[number, number]>([0, 100]) // percentage of day
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [showLevelPrices, setShowLevelPrices] = useState(true) // Show prices in chart labels
  const [hoveredLevel, setHoveredLevel] = useState<{type: 'support' | 'resistance', level: number, value: number} | null>(null)

  const fetchIntradayData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true)
      const data = await fetchMaxPainIntradayChart('nifty', 'nse')
      setIntradayData(data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching intraday data:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const handleManualRefresh = useCallback(() => {
    fetchIntradayData(true)
  }, [fetchIntradayData])

  useEffect(() => {
    // Load strategy data from localStorage
    const data = localStorage.getItem('gannStrategyData')
    if (data) {
      try {
        const parsedData = JSON.parse(data)
        setStrategyData(parsedData)
      } catch (err) {
        setError('Failed to load strategy data')
        setLoading(false)
        return
      }
    } else {
      setError('No strategy data found')
      setLoading(false)
      return
    }

    // Initial data fetch
    fetchIntradayData()
  }, [fetchIntradayData])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchIntradayData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchIntradayData])

  const getChartData = () => {
    if (!intradayData.length) return []

    // Get the first entry (should contain all the comma-separated data)
    const data = intradayData[0]

    // Split the comma-separated values
    const spotPrices = data.spot_price.split(',').map(price => parseFloat(price.trim()))
    const timeStamps = data.created_at.split(',').map(time => time.trim())

    // Process each data point
    const chartData = spotPrices
      .map((price, index) => {
        if (isNaN(price) || !timeStamps[index]) return null

        // Parse time
        const timeParts = timeStamps[index].split(':')
        const hour = parseInt(timeParts[0] || '9')
        const minute = parseInt(timeParts[1] || '15')

        // Convert to minutes since market open (9:15 AM = 0 minutes)
        const minutesSinceOpen = (hour - 9) * 60 + (minute - 15)

        return {
          time: timeStamps[index].substring(0, 5), // HH:MM format
          price: price,
          minutesSinceOpen: minutesSinceOpen,
          index: index
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.minutesSinceOpen - b.minutesSinceOpen)

    // Apply time filtering
    if (chartData.length > 0) {
      const startIndex = Math.floor((timeFilter[0] / 100) * chartData.length)
      const endIndex = Math.floor((timeFilter[1] / 100) * chartData.length)
      return chartData.slice(startIndex, endIndex + 1)
    }

    return chartData
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  }

  // Correct Option Trading Signals for Indian Traders
  const getOptionSignal = () => {
    if (!strategyData?.gannLevels || !strategyData?.currentNiftyPrice) return null

    const currentPrice = strategyData.currentNiftyPrice
    const supports = strategyData.gannLevels.supports.map((s: any) => s.value).sort((a: number, b: number) => b - a)
    const resistances = strategyData.gannLevels.resistances.map((r: any) => r.value).sort((a: number, b: number) => a - b)

    // Get all 5 levels
    const S1 = supports[0] // First support level
    const S2 = supports[1] // Second support level
    const S3 = supports[2] // Third support level
    const S4 = supports[3] // Fourth support level
    const S5 = supports[4] // Fifth support level
    const R1 = resistances[0] // First resistance level
    const R2 = resistances[1] // Second resistance level
    const R3 = resistances[2] // Third resistance level
    const R4 = resistances[3] // Fourth resistance level
    const R5 = resistances[4] // Fifth resistance level

    // PUT BUY: When price goes BELOW S1 (bearish trend)
    if (currentPrice < S1) {
      // Determine current target based on which levels are hit
      let currentTarget, stopLoss, targetHit

      if (currentPrice <= S5 && S5) {
        // All targets hit, hold with S5 as stoploss
        currentTarget = 'All Targets Hit'
        stopLoss = formatNumber(S5)
        targetHit = 'S5 ✅'
      } else if (currentPrice <= S4 && S4) {
        // S4 hit, now targeting S5 with S4 as stoploss
        currentTarget = S5 ? formatNumber(S5) : 'All Targets Hit'
        stopLoss = formatNumber(S4)
        targetHit = 'S4 ✅'
      } else if (currentPrice <= S3 && S3) {
        // S3 hit, now targeting S4 with S3 as stoploss
        currentTarget = S4 ? formatNumber(S4) : formatNumber(S5 || S4 || S3)
        stopLoss = formatNumber(S3)
        targetHit = 'S3 ✅'
      } else if (currentPrice <= S2 && S2) {
        // S2 hit, now targeting S3 with S2 as stoploss
        currentTarget = formatNumber(S3)
        stopLoss = formatNumber(S2)
        targetHit = 'S2 ✅'
      } else {
        // Below S1, targeting S2 with S1 as stoploss
        currentTarget = formatNumber(S2)
        stopLoss = formatNumber(S1)
        targetHit = 'Below S1'
      }

      return {
        signal: 'PUT BUY',
        type: 'BEARISH',
        perspective: 'PUT',
        description: `NIFTY below S1 - PUT buying zone`,
        entry: `Buy PUT below ${formatNumber(S1)}`,
        currentTarget,
        stopLoss,
        targetHit,
        targetsProgress: [
          { level: 'S1', value: S1, status: currentPrice < S1 ? 'HIT' : 'ENTRY' },
          { level: 'S2', value: S2, status: currentPrice <= S2 ? 'HIT' : 'TARGET' },
          { level: 'S3', value: S3, status: currentPrice <= S3 ? 'HIT' : 'TARGET' },
          { level: 'S4', value: S4, status: S4 && currentPrice <= S4 ? 'HIT' : 'TARGET' },
          { level: 'S5', value: S5, status: S5 && currentPrice <= S5 ? 'HIT' : 'TARGET' }
        ].filter(target => target.value) // Filter out undefined levels
      }
    }
    // CALL BUY: When price goes ABOVE R1 (bullish trend)
    else if (currentPrice > R1) {
      // Determine current target based on which levels are hit
      let currentTarget, stopLoss, targetHit

      if (currentPrice >= R5 && R5) {
        // All targets hit, hold with R5 as stoploss
        currentTarget = 'All Targets Hit'
        stopLoss = formatNumber(R5)
        targetHit = 'R5 ✅'
      } else if (currentPrice >= R4 && R4) {
        // R4 hit, now targeting R5 with R4 as stoploss
        currentTarget = R5 ? formatNumber(R5) : 'All Targets Hit'
        stopLoss = formatNumber(R4)
        targetHit = 'R4 ✅'
      } else if (currentPrice >= R3 && R3) {
        // R3 hit, now targeting R4 with R3 as stoploss
        currentTarget = R4 ? formatNumber(R4) : formatNumber(R5 || R4 || R3)
        stopLoss = formatNumber(R3)
        targetHit = 'R3 ✅'
      } else if (currentPrice >= R2 && R2) {
        // R2 hit, now targeting R3 with R2 as stoploss
        currentTarget = formatNumber(R3)
        stopLoss = formatNumber(R2)
        targetHit = 'R2 ✅'
      } else {
        // Above R1, targeting R2 with R1 as stoploss
        currentTarget = formatNumber(R2)
        stopLoss = formatNumber(R1)
        targetHit = 'Above R1'
      }

      return {
        signal: 'CALL BUY',
        type: 'BULLISH',
        perspective: 'CALL',
        description: `NIFTY above R1 - CALL buying zone`,
        entry: `Buy CALL above ${formatNumber(R1)}`,
        currentTarget,
        stopLoss,
        targetHit,
        targetsProgress: [
          { level: 'R1', value: R1, status: currentPrice > R1 ? 'HIT' : 'ENTRY' },
          { level: 'R2', value: R2, status: currentPrice >= R2 ? 'HIT' : 'TARGET' },
          { level: 'R3', value: R3, status: currentPrice >= R3 ? 'HIT' : 'TARGET' },
          { level: 'R4', value: R4, status: R4 && currentPrice >= R4 ? 'HIT' : 'TARGET' },
          { level: 'R5', value: R5, status: R5 && currentPrice >= R5 ? 'HIT' : 'TARGET' }
        ].filter(target => target.value) // Filter out undefined levels
      }
    }

    // Price between S1 and R1 - Wait for breakout
    return {
      signal: 'WAIT',
      type: 'SIDEWAYS',
      perspective: 'NEUTRAL',
      description: `NIFTY between S1 (${formatNumber(S1)}) and R1 (${formatNumber(R1)})`,
      entry: 'Wait for breakout above R1 (CALL) or breakdown below S1 (PUT)',
      currentTarget: 'N/A',
      stopLoss: 'N/A',
      targetHit: 'Waiting',
      targetsProgress: [
        { level: 'S1', value: S1, status: 'SUPPORT' },
        { level: 'R1', value: R1, status: 'RESISTANCE' }
      ]
    }
  }

  const getTargetLevels = () => {
    if (!strategyData?.gannLevels || !strategyData?.currentNiftyPrice) return []

    const currentPrice = strategyData.currentNiftyPrice
    const supports = strategyData.gannLevels.supports.map((s: any) => s.value).sort((a: number, b: number) => b - a)
    const resistances = strategyData.gannLevels.resistances.map((r: any) => r.value).sort((a: number, b: number) => a - b)

    const signal = getOptionSignal()
    const targets: Array<{
      type: 'PUT_TARGET' | 'CALL_TARGET'
      level: number
      levelName: string
      distance: string
      status: string
      role: string
    }> = []

    // Show levels based on current perspective
    if (signal?.perspective === 'PUT') {
      // In PUT perspective, show support levels as targets
      supports.forEach((support: number, index: number) => {
        targets.push({
          type: 'PUT_TARGET',
          level: support,
          levelName: `S${index + 1}`,
          distance: currentPrice < support ? ((support - currentPrice) / currentPrice * 100).toFixed(1) : '0.0',
          status: currentPrice <= support ? 'HIT' : 'TARGET',
          role: index === 0 ? 'ENTRY' : index === 1 ? 'TARGET1' : index === 2 ? 'TARGET2' :
                index === 3 ? 'TARGET3' : index === 4 ? 'TARGET4' : 'FAR_TARGET'
        })
      })
    } else if (signal?.perspective === 'CALL') {
      // In CALL perspective, show resistance levels as targets
      resistances.forEach((resistance: number, index: number) => {
        targets.push({
          type: 'CALL_TARGET',
          level: resistance,
          levelName: `R${index + 1}`,
          distance: currentPrice < resistance ? ((resistance - currentPrice) / currentPrice * 100).toFixed(1) : '0.0',
          status: currentPrice >= resistance ? 'HIT' : currentPrice < resistance ? 'TARGET' : 'CURRENT',
          role: index === 0 ? 'ENTRY' : index === 1 ? 'TARGET1' : index === 2 ? 'TARGET2' :
                index === 3 ? 'TARGET3' : index === 4 ? 'TARGET4' : 'FAR_TARGET'
        })
      })
    } else {
      // Neutral perspective - show both
      supports.forEach((support: number, index: number) => {
        targets.push({
          type: 'PUT_TARGET',
          level: support,
          levelName: `S${index + 1}`,
          distance: currentPrice > support ? ((currentPrice - support) / currentPrice * 100).toFixed(1) : '0.0',
          status: currentPrice >= support ? 'HIT' : 'SUPPORT',
          role: 'SUPPORT'
        })
      })

      resistances.forEach((resistance: number, index: number) => {
        targets.push({
          type: 'CALL_TARGET',
          level: resistance,
          levelName: `R${index + 1}`,
          distance: currentPrice < resistance ? ((resistance - currentPrice) / currentPrice * 100).toFixed(1) : '0.0',
          status: currentPrice >= resistance ? 'HIT' : 'RESISTANCE',
          role: 'RESISTANCE'
        })
      })
    }

    return targets.slice(0, 10) // Return all available levels (up to 5 support + 5 resistance)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading Gann Strategy...</p>
        </div>
      </div>
    )
  }

  if (error || !strategyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <p className="text-red-600">{error || 'Strategy data not found'}</p>
          <Button onClick={() => window.close()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const chartData = getChartData()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)]">
                  <span className="hidden sm:inline">Gann Level Strategy Live</span>
                  <span className="sm:hidden">Gann Strategy Live</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Base Price: {formatNumber(parseFloat(strategyData.basePrice))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs px-2 py-1">
                <div className={`w-2 h-2 rounded-full mr-1 ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="hidden sm:inline">{autoRefresh ? 'Auto Refresh' : 'Manual'}</span>
                <span className="sm:hidden">{autoRefresh ? 'Auto' : 'Manual'}</span>
              </Badge>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                <span className="hidden sm:inline">Last: {lastRefresh.toLocaleTimeString()}</span>
                <span className="sm:hidden">{lastRefresh.toLocaleTimeString().split(' ')[1]}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="text-xs px-2 py-1 h-7"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-1">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-xs px-2 py-1 h-7"
              >
                <Activity className="w-3 h-3" />
                <span className="hidden sm:inline ml-1">{autoRefresh ? 'Disable' : 'Enable'} Auto</span>
                <span className="sm:hidden ml-1">{autoRefresh ? 'Off' : 'On'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.close()}
                className="text-xs px-2 py-1 h-7"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Close</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart Section - Takes 2/3 on large screens */}
          <div className="xl:col-span-2 space-y-6">
            {/* Live Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  NIFTY Intraday Chart with Gann Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="h-96 w-full relative">
                  {chartData.length > 0 ? (
                    <>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          interval="preserveStartEnd"
                          minTickGap={60}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          domain={chartMode === 'zoomed' && strategyData.gannLevels ?
                            [
                              Math.min(...strategyData.gannLevels.supports.map((s: any) => s.value), ...strategyData.gannLevels.resistances.map((r: any) => r.value)) - 20,
                              Math.max(...strategyData.gannLevels.supports.map((s: any) => s.value), ...strategyData.gannLevels.resistances.map((r: any) => r.value)) + 20
                            ] :
                            ['dataMin - 100', 'dataMax + 100']
                          }
                          tickFormatter={(value) => formatNumber(value)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: any) => [formatNumber(value), "NIFTY Price"]}
                          labelFormatter={(label) => `Time: ${label}`}
                        />

                        {/* NIFTY Price Line */}
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: '#2563eb' }}
                        />

                        {/* Support Levels - Horizontal Lines */}
                        {strategyData.gannLevels.supports.map((level: any) => (
                          <ReferenceLine
                            key={`support-${level.order}`}
                            y={level.value}
                            stroke="#16a34a"
                            strokeDasharray="5 5"
                              strokeWidth={2}
                              strokeOpacity={0.8}
                              onMouseEnter={() => setHoveredLevel({ type: 'support', level: level.order, value: level.value })}
                              onMouseLeave={() => setHoveredLevel(null)}
                            label={{
                                value: showLevelPrices ? `S${level.order}: ${formatNumber(level.value)}` : `S${level.order}`,
                              position: "insideTopRight",
                              fill: "#16a34a",
                                fontSize: 11,
                                fontWeight: "bold",
                                style: { cursor: 'pointer' }
                            }}
                          />
                        ))}

                        {/* Resistance Levels - Horizontal Lines */}
                        {strategyData.gannLevels.resistances.map((level: any) => (
                          <ReferenceLine
                            key={`resistance-${level.order}`}
                            y={level.value}
                            stroke="#dc2626"
                            strokeDasharray="5 5"
                              strokeWidth={2}
                              strokeOpacity={0.8}
                              onMouseEnter={() => setHoveredLevel({ type: 'resistance', level: level.order, value: level.value })}
                              onMouseLeave={() => setHoveredLevel(null)}
                            label={{
                                value: showLevelPrices ? `R${level.order}: ${formatNumber(level.value)}` : `R${level.order}`,
                              position: "insideTopLeft",
                              fill: "#dc2626",
                                fontSize: 11,
                                fontWeight: "bold",
                                style: { cursor: 'pointer' }
                            }}
                          />
                        ))}

                      </ComposedChart>
                    </ResponsiveContainer>

                      {/* Hover Tooltip for Level Prices */}
                      {hoveredLevel && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg z-10">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                hoveredLevel.type === 'support' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            <span className="font-bold text-sm">
                              {hoveredLevel.type === 'support' ? 'S' : 'R'}{hoveredLevel.level}
                            </span>
                            <span className="text-sm font-mono font-semibold">
                              {formatNumber(hoveredLevel.value)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {hoveredLevel.type === 'support' ? 'Support Level' : 'Resistance Level'}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No chart data available
                    </div>
                  )}
                </div>

                {/* Chart Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-600"></div>
                    <span>NIFTY Price Movement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-600"></div>
                    <span>Gann Support Levels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-600"></div>
                    <span>Gann Resistance Levels</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Chart Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">View Mode:</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={chartMode === 'full' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartMode('full')}
                      className="h-8"
                    >
                      <ZoomOut className="w-3 h-3 mr-1" />
                      Full View
                    </Button>
                    <Button
                      variant={chartMode === 'zoomed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartMode('zoomed')}
                      className="h-8"
                    >
                      <ZoomIn className="w-3 h-3 mr-1" />
                      Zoomed
                    </Button>
                  </div>
                </div>

                {/* Level Price Display Toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Show Level Prices:</Label>
                  <Button
                    variant={showLevelPrices ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowLevelPrices(!showLevelPrices)}
                    className="text-xs"
                  >
                    {showLevelPrices ? "On" : "Off"}
                  </Button>
                </div>

                {/* Time Range Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Time Range:</Label>
                    <span className="text-xs text-muted-foreground">
                      {timeFilter[0]}% - {timeFilter[1]}%
                    </span>
                  </div>
                  <Slider
                    value={timeFilter}
                    onValueChange={(value) => setTimeFilter(value as [number, number])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>9:15 AM</span>
                    <span>3:30 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Levels Panel - Takes 1/3 on large screens */}
          <div className="space-y-6">
            {/* Enhanced Strategy Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Strategy Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Option Trading Signal */}
                {(() => {
                  const signal = getOptionSignal()
                  return signal ? (
                    <div className="p-4 rounded-lg space-y-4 border-2" style={{
                      backgroundColor: signal.signal === 'PUT BUY' ? '#fef2f2' :
                                     signal.signal === 'CALL BUY' ? '#f0fdf4' :
                                     '#f8fafc',
                      borderColor: signal.signal === 'PUT BUY' ? '#dc2626' :
                                  signal.signal === 'CALL BUY' ? '#16a34a' :
                                  '#64748b'
                    }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold">Option Signal</span>
                          <div className="text-sm text-muted-foreground">
                            Perspective: {signal.perspective}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-sm font-bold px-3 py-1 ${
                            signal.signal === 'PUT BUY' ? 'bg-red-600 text-white border-red-600' :
                            signal.signal === 'CALL BUY' ? 'bg-green-600 text-white border-green-600' :
                            'bg-gray-500 text-white border-gray-500'
                          }`}
                        >
                          {signal.signal}
                        </Badge>
                      </div>

                      <div className="text-sm font-medium text-center bg-white/50 p-2 rounded">
                        {signal.description}
                      </div>

                      <div className="text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded">
                        📍 {signal.entry}
                      </div>

                      {/* Current Target & Stop Loss */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded border">
                          <div className="text-xs text-green-700 font-medium">Current Target</div>
                          <div className="text-lg font-bold text-green-800">{signal.currentTarget}</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded border">
                          <div className="text-xs text-red-700 font-medium">Stop Loss</div>
                          <div className="text-lg font-bold text-red-800">{signal.stopLoss}</div>
                        </div>
                      </div>

                      {/* Target Progress */}
                      <div className="bg-white/50 rounded p-3">
                        <div className="text-sm font-medium text-center mb-3">Target Progress</div>
                        <div className="space-y-2">
                          {signal.targetsProgress.map((target, index) => (
                            <div key={index} className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    target.status === 'HIT' ? 'bg-green-100 text-green-800 border-green-300' :
                                    target.status === 'TARGET' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                    target.status === 'ENTRY' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                    'bg-gray-100 text-gray-800 border-gray-300'
                                  }`}
                                >
                                  {target.level}
                                </Badge>
                                <span className="text-sm font-mono">{formatNumber(target.value)}</span>
                              </div>
                              <span className={`text-xs font-medium ${
                                target.status === 'HIT' ? 'text-green-600' :
                                target.status === 'TARGET' ? 'text-blue-600' :
                                target.status === 'ENTRY' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {target.status === 'HIT' ? '✅ Hit' :
                                 target.status === 'TARGET' ? '🎯 Target' :
                                 target.status === 'ENTRY' ? '📍 Entry' :
                                 target.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-xs text-purple-700 font-medium">Status</div>
                        <div className="text-sm font-bold text-purple-800">{signal.targetHit}</div>
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <p className="text-xs text-muted-foreground">Base Price</p>
                    <p className="font-mono font-semibold text-sm">{formatNumber(parseFloat(strategyData.basePrice))}</p>
                </div>
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <p className="text-xs text-muted-foreground">Current NIFTY</p>
                    <p className="font-mono font-semibold text-blue-600 text-sm">
                    {strategyData.currentNiftyPrice ? formatNumber(strategyData.currentNiftyPrice) : 'N/A'}
                    </p>
                  </div>
                </div>


                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Generated:</span>
                  <span>{new Date(strategyData.timestamp).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Gann Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Gann Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resistance Levels */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Resistance</span>
                  </div>
                  <div className="space-y-2">
                    {strategyData.gannLevels.resistances.map((level: any) => (
                      <div key={level.order} className="flex items-center justify-between py-1">
                        <span className="text-sm text-red-700">R{level.order}:</span>
                        <span className="font-mono text-sm font-semibold text-red-800">
                          {formatNumber(level.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support Levels */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Support</span>
                  </div>
                  <div className="space-y-2">
                    {strategyData.gannLevels.supports.map((level: any) => (
                      <div key={level.order} className="flex items-center justify-between py-1">
                        <span className="text-sm text-green-700">S{level.order}:</span>
                        <span className="font-mono text-sm font-semibold text-green-800">
                          {formatNumber(level.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  )
}
