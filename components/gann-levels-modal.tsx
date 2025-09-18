"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculateGannLevels } from "@/lib/utils"
import { TrendingUp, TrendingDown, Calculator, BarChart3, ZoomIn, ZoomOut } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceDot, Tooltip, ComposedChart } from "recharts"
import { Slider } from "@/components/ui/slider"
import { fetchMaxPainIntradayChart, MaxPainIntradayData } from "@/lib/api"

interface GannLevelsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function GannLevelsModal({ open, onOpenChange }: GannLevelsModalProps) {
  const [basePrice, setBasePrice] = useState("")
  const [gannLevels, setGannLevels] = useState<{ resistances: any[], supports: any[] } | null>(null)
  const [error, setError] = useState("")
  const [currentNiftyPrice, setCurrentNiftyPrice] = useState<number | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [intradayData, setIntradayData] = useState<MaxPainIntradayData[]>([])
  const [loadingChart, setLoadingChart] = useState(false)
  const [chartMode, setChartMode] = useState<'full' | 'zoomed'>('full')
  const [timeFilter, setTimeFilter] = useState<[number, number]>([0, 100]) // percentage of day

  // Fetch current NIFTY price when modal opens
  const fetchCurrentNiftyPrice = async () => {
    try {
      setLoadingPrice(true)
      const response = await fetch('/api/today-spot-data?symbol=nifty')
      if (response.ok) {
        const data = await response.json()
        if (data.resultData && data.resultData.last_trade_price) {
          setCurrentNiftyPrice(data.resultData.last_trade_price)
        }
      }
    } catch (err) {
      console.error('Error fetching current NIFTY price:', err)
    } finally {
      setLoadingPrice(false)
    }
  }

  // Fetch intraday chart data
  const fetchIntradayData = async () => {
    try {
      setLoadingChart(true)
      const data = await fetchMaxPainIntradayChart('nifty', 'nse')
      setIntradayData(data)
    } catch (err) {
      console.error('Error fetching intraday data:', err)
      setIntradayData([])
    } finally {
      setLoadingChart(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCurrentNiftyPrice()
      fetchIntradayData()
    }
  }, [open])

  const handleCalculate = () => {
    try {
      const price = parseFloat(basePrice)
      if (isNaN(price) || price <= 0) {
        setError("Please enter a valid positive number")
        return
      }

      const levels = calculateGannLevels(price)
      setGannLevels(levels)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setGannLevels(null)
    }
  }

  const handleReset = () => {
    setBasePrice("")
    setGannLevels(null)
    setError("")
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  }

  // Prepare chart data from intraday data
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Gann Levels Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate Gann support and resistance levels based on a base price
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Base Price Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-price">Enter Base Price</Label>
                <Input
                  id="base-price"
                  type="number"
                  placeholder="e.g., 25000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="text-lg"
                  step="0.01"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleCalculate} className="flex-1">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Gann Levels
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {gannLevels && (
            <div className="space-y-6">
              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Gann Levels Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    {getChartData().length > 0 && !loadingChart ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            interval="preserveStartEnd"
                            minTickGap={50}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            domain={chartMode === 'zoomed' && gannLevels ?
                              [
                                Math.min(...gannLevels.supports.map(s => s.value), ...gannLevels.resistances.map(r => r.value)) - 20,
                                Math.max(...gannLevels.supports.map(s => s.value), ...gannLevels.resistances.map(r => r.value)) + 20
                              ] :
                              ['dataMin - 50', 'dataMax + 50']
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
                          {gannLevels.supports.map((level) => (
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
                          {gannLevels.resistances.map((level) => (
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

                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        {loadingChart ? 'Loading intraday data...' : 'No chart data available'}
                      </div>
                    )}
                  </div>

                  {/* Chart Legend */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-blue-600 flex-shrink-0"></div>
                      <span className="whitespace-nowrap">NIFTY Price Movement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-green-600 flex-shrink-0"></div>
                      <span className="whitespace-nowrap">Gann Support Levels</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-red-600 flex-shrink-0"></div>
                      <span className="whitespace-nowrap">Gann Resistance Levels</span>
                    </div>
                  </div>

                  {/* Current Price Info */}
                  <div className="mt-2 text-center text-xs text-muted-foreground">
                    Current NIFTY: {loadingPrice ? 'Loading...' : currentNiftyPrice ? formatNumber(currentNiftyPrice) : 'N/A'}
                    {loadingChart && ' • Loading intraday data...'}
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
                <CardContent>
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

              {/* Gann Levels Display - Desktop Minimal Style */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Gann Levels Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Resistance Levels */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Resistance Levels</span>
                      </div>
                      <div className="space-y-2">
                        {gannLevels.resistances.map((level) => (
                          <div key={level.order} className="flex items-center justify-between py-2 px-3 bg-red-50/50 rounded-lg border border-red-100">
                            <span className="text-sm font-medium text-red-700">R{level.order}:</span>
                            <span className="font-mono font-semibold text-red-800">{formatNumber(level.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Support Levels */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Support Levels</span>
                      </div>
                      <div className="space-y-2">
                        {gannLevels.supports.map((level) => (
                          <div key={level.order} className="flex items-center justify-between py-2 px-3 bg-green-50/50 rounded-lg border border-green-100">
                            <span className="text-sm font-medium text-green-700">S{level.order}:</span>
                            <span className="font-mono font-semibold text-green-800">{formatNumber(level.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Instructions */}
          {!gannLevels && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>How to use:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Enter the base price (e.g., current NIFTY level)</li>
                    <li>Click "Calculate Gann Levels" to generate support and resistance levels</li>
                    <li>Resistance levels are potential selling points</li>
                    <li>Support levels are potential buying points</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
