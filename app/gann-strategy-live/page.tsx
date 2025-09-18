"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Calculator, ArrowLeft, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, ComposedChart } from "recharts"
import { fetchMaxPainIntradayChart, MaxPainIntradayData } from "@/lib/api"

export default function GannStrategyLivePage() {
  const [strategyData, setStrategyData] = useState<any>(null)
  const [intradayData, setIntradayData] = useState<MaxPainIntradayData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    // Fetch intraday data
    fetchIntradayData()
  }, [])

  const fetchIntradayData = async () => {
    try {
      const data = await fetchMaxPainIntradayChart('nifty', 'nse')
      setIntradayData(data)
    } catch (err) {
      console.error('Error fetching intraday data:', err)
    } finally {
      setLoading(false)
    }
  }

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

    return chartData
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
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
                <h1 className="text-xl font-bold font-[family-name:var(--font-space-grotesk)]">
                  Gann Level Strategy Live
                </h1>
                <p className="text-sm text-muted-foreground">
                  Base Price: {formatNumber(parseFloat(strategyData.basePrice))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live Data
              </Badge>
              <Button variant="outline" onClick={() => window.close()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Close
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
                <div className="h-96 w-full">
                  {chartData.length > 0 ? (
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
                          domain={['dataMin - 100', 'dataMax + 100']}
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
                            strokeWidth={1}
                            label={{
                              value: `S${level.order}`,
                              position: "insideTopRight",
                              fill: "#16a34a",
                              fontSize: 10,
                              fontWeight: "bold"
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
                            strokeWidth={1}
                            label={{
                              value: `R${level.order}`,
                              position: "insideTopLeft",
                              fill: "#dc2626",
                              fontSize: 10,
                              fontWeight: "bold"
                            }}
                          />
                        ))}

                        {/* Current NIFTY Price */}
                        {strategyData.currentNiftyPrice && (
                          <ReferenceLine
                            y={strategyData.currentNiftyPrice}
                            stroke="#2563eb"
                            strokeWidth={2}
                            label={{
                              value: `Current: ${formatNumber(strategyData.currentNiftyPrice)}`,
                              position: "insideBottomRight",
                              fill: "#2563eb",
                              fontSize: 11,
                              fontWeight: "bold"
                            }}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
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
          </div>

          {/* Levels Panel - Takes 1/3 on large screens */}
          <div className="space-y-6">
            {/* Strategy Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Strategy Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Price:</span>
                  <span className="font-mono font-semibold">{formatNumber(parseFloat(strategyData.basePrice))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current NIFTY:</span>
                  <span className="font-mono font-semibold text-blue-600">
                    {strategyData.currentNiftyPrice ? formatNumber(strategyData.currentNiftyPrice) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Generated:</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(strategyData.timestamp).toLocaleString()}
                  </span>
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

            {/* Trading Signals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trading Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {strategyData.currentNiftyPrice && (
                  <>
                    {strategyData.gannLevels.resistances.some((level: any) =>
                      Math.abs(level.value - strategyData.currentNiftyPrice) < 50
                    ) && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">⚠️ Near Resistance Level</p>
                        <p className="text-xs text-red-600">Consider taking profits</p>
                      </div>
                    )}

                    {strategyData.gannLevels.supports.some((level: any) =>
                      Math.abs(level.value - strategyData.currentNiftyPrice) < 50
                    ) && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">✅ Near Support Level</p>
                        <p className="text-xs text-green-600">Potential buying opportunity</p>
                      </div>
                    )}

                    {!strategyData.gannLevels.resistances.some((level: any) =>
                      Math.abs(level.value - strategyData.currentNiftyPrice) < 50
                    ) && !strategyData.gannLevels.supports.some((level: any) =>
                      Math.abs(level.value - strategyData.currentNiftyPrice) < 50
                    ) && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">📊 Mid-Range Movement</p>
                        <p className="text-xs text-blue-600">Monitor for breakouts</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
