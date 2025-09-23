"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TrendingUp, TrendingDown, Calculator, ArrowLeft, Activity, ZoomIn, ZoomOut, BarChart3, RefreshCw, Zap, Info, ChevronDown, ChevronUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, ComposedChart, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid } from "recharts"
import { Slider } from "@/components/ui/slider"
import { fetchMaxPainIntradayChart, MaxPainIntradayData, fetchTrendingOIData, TrendingOIData, fetchFutureExpiryData, formatNumber } from "@/lib/api"

// Define the strategy data interface
interface GannLevel {
  order: number
  value: number
}

interface GannLevels {
  supports: GannLevel[]
  resistances: GannLevel[]
}

interface StrategyData {
  basePrice: string
  currentNiftyPrice: number
  gannLevels: GannLevels
  timestamp: string
}

export default function GannStrategyLivePage() {
  const [strategyData, setStrategyData] = useState<StrategyData | null>(null)
  const strategyDataRef = useRef<StrategyData | null>(null)
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
  const [showStrategyInfo, setShowStrategyInfo] = useState(false) // Show strategy explanation
  const [chartControlsCollapsed, setChartControlsCollapsed] = useState(false) // Chart controls collapsed state

  // OI Analytics state
  const [oiInterval, setOiInterval] = useState('3') // 1, 3, 5 minutes
  const [defaultStartStrike, setDefaultStartStrike] = useState('24650') // Default start strike
  const [defaultEndStrike, setDefaultEndStrike] = useState('25600') // Default end strike
  const [selectedExpiry, setSelectedExpiry] = useState('') // Selected expiry for chart
  const [expiryOptions, setExpiryOptions] = useState<any[]>([]) // Available expiry options
  const [trendingData, setTrendingData] = useState<TrendingOIData[]>([])
  const [oiLoading, setOiLoading] = useState(false)


  // Generate weekly expiry dates starting from next valid expiry (Tuesday)
  const generateWeeklyExpiryDates = (): any[] => {
    const expiryDates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    // Find the next Tuesday (NIFTY expiry day)
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
    let daysUntilNextTuesday = 2 - currentDay // Tuesday is day 2

    if (daysUntilNextTuesday < 0) {
      // If today is Wednesday, Thursday, Friday, Saturday, Sunday, Monday, get next Tuesday
      daysUntilNextTuesday += 7
    } else if (daysUntilNextTuesday === 0) {
      // If today is Tuesday, check if it's before market close (3:30 PM)
      const now = new Date()
      const marketClose = new Date(today)
      marketClose.setHours(15, 30, 0, 0) // 3:30 PM

      if (now > marketClose) {
        // Market closed, get next Tuesday
        daysUntilNextTuesday += 7
      }
      // If market still open, use today's Tuesday expiry
    }

    // Start from the next Tuesday
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + daysUntilNextTuesday)

    // Generate next 8 weekly expiry dates (every 7 days from the next Tuesday)
    for (let i = 0; i < 8; i++) {
      const expiryDate = new Date(startDate)
      expiryDate.setDate(startDate.getDate() + (i * 7))

      // Only include future dates (should always be true with new logic)
      if (expiryDate >= today) {
        // Use local date to avoid timezone issues
        const year = expiryDate.getFullYear()
        const month = String(expiryDate.getMonth() + 1).padStart(2, '0')
        const day = String(expiryDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        const monthShort = dateStr.slice(5, 7)
        const dayShort = dateStr.slice(8, 10)

        expiryDates.push({
          expiry: dateStr + 'T00:00:00',
          trading_symbol: `NIFTY${monthShort}${dayShort}FUT`,
          expiry_date: dateStr
        })
      }
    }

    // Fallback: If no dates generated, create some default future dates
    if (expiryDates.length === 0) {
      const fallbackDate = new Date(today)
      fallbackDate.setDate(today.getDate() + 7) // Next week

      for (let i = 0; i < 4; i++) {
        const expiryDate = new Date(fallbackDate)
        expiryDate.setDate(fallbackDate.getDate() + (i * 7))

        // Use local date to avoid timezone issues
        const year = expiryDate.getFullYear()
        const month = String(expiryDate.getMonth() + 1).padStart(2, '0')
        const day = String(expiryDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        const monthShort = dateStr.slice(5, 7)
        const dayShort = dateStr.slice(8, 10)

        expiryDates.push({
          expiry: dateStr + 'T00:00:00',
          trading_symbol: `NIFTY${monthShort}${dayShort}FUT`,
          expiry_date: dateStr
        })
      }
    }

    return expiryDates
  }

  const fetchIntradayData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true)
      const data = await fetchMaxPainIntradayChart('nifty', 'nse')
      setIntradayData(data)
      setLastRefresh(new Date())

      // Update current NIFTY price in strategy data if we have strategy data
      if (strategyDataRef.current && data.length > 0) {
        const latestData = data[0]
        const spotPrices = latestData.spot_price.split(',').map(price => parseFloat(price.trim()))
        const latestPrice = spotPrices[spotPrices.length - 1] // Get the last (most recent) price

        if (!isNaN(latestPrice)) {
          setStrategyData(prevData => {
            if (!prevData) return prevData
            return {
              ...prevData,
              currentNiftyPrice: latestPrice,
              timestamp: new Date().toISOString()
            }
          })
        }
      }
    } catch (err) {
      console.error('Error fetching intraday data:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Generate default strike range from start to end
  const generateDefaultStrikeRange = (start: string, end: string): string => {
    const startStrike = parseInt(start)
    const endStrike = parseInt(end)
    const strikes = []

    for (let strike = startStrike; strike <= endStrike; strike += 50) {
      strikes.push(strike.toString())
    }

    return strikes.join(',')
  }

  // Fetch OI Analytics data (only trending data now)
  const fetchOIData = useCallback(async () => {
    try {
      setOiLoading(true)

      // Determine strike range for trending data (always use default range now)
      const strikeRange = generateDefaultStrikeRange(defaultStartStrike, defaultEndStrike)

      // Fetch trending OI data for time-series
      const rawTrendingData = await fetchTrendingOIData(
        'nifty',
        strikeRange,
        selectedExpiry,
        oiInterval,
        ''
      )

      setTrendingData(rawTrendingData)

    } catch (err) {
      console.error('Error fetching OI data:', err)
      // Set empty data if there's an error
      setTrendingData([])
    } finally {
      setOiLoading(false)
    }
  }, [oiInterval, defaultStartStrike, defaultEndStrike, selectedExpiry])

  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing || oiLoading) return // Prevent multiple simultaneous refreshes

    try {
      await Promise.all([
        fetchIntradayData(true),
        fetchOIData()
      ])
    } catch (error) {
      console.error('Error during manual refresh:', error)
    }
  }, [fetchIntradayData, fetchOIData, isRefreshing, oiLoading])

  // Keep ref updated with current strategy data
  useEffect(() => {
    strategyDataRef.current = strategyData
  }, [strategyData])

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
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchIntradayData(),
          fetchOIData()
        ])
      } catch (error) {
        console.error('Error during initial data fetch:', error)
      }
    }

    initializeData()
  }, [fetchIntradayData, fetchOIData])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      if (isRefreshing || oiLoading) return // Skip if already refreshing

      try {
        await Promise.all([
          fetchIntradayData(),
          fetchOIData()
        ])
      } catch (error) {
        console.error('Error during auto-refresh:', error)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchIntradayData, fetchOIData, isRefreshing, oiLoading])

  // Initialize expiry options on component mount
  useEffect(() => {
    const expiryData = generateWeeklyExpiryDates()
    setExpiryOptions(expiryData)
    if (expiryData.length > 0 && !selectedExpiry) {
      setSelectedExpiry(expiryData[0].expiry)
    }
  }, [])

  // OI data is fetched in the initial data load useEffect above

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


  // Prepare time-series data
  const timeSeriesData = trendingData.map((item) => ({
    time: item.time,
    callChangeOI: item.calls_change_oi || 0,
    putChangeOI: item.puts_change_oi || 0,
    indexClose: item.index_close || 0
  })).sort((a, b) => {
    const [aHours, aMinutes] = a.time.split(':').map(Number)
    const [bHours, bMinutes] = b.time.split(':').map(Number)
    return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes)
  })

  // Process OI data for charts - use latest values from time series
  const processOIDataForCharts = () => {
    if (!timeSeriesData.length) return { latestCallsChangeOI: 0, latestPutsChangeOI: 0 }

    // Get the latest (most recent) data point from time series
    const latestData = timeSeriesData[timeSeriesData.length - 1]

    // Values are already in the correct format, no need to divide by 100000 as they're not aggregated across strikes like before
    const latestCallsChangeOI = latestData.callChangeOI || 0
    const latestPutsChangeOI = latestData.putChangeOI || 0

    return { latestCallsChangeOI, latestPutsChangeOI }
  }

  const { latestCallsChangeOI, latestPutsChangeOI } = processOIDataForCharts()

  // Data for Calls vs Puts chart - showing latest CE/PE change values from time series
  const callsPutsData = [
    {
      name: "Calls",
      calls: latestCallsChangeOI,
      puts: 0,
      fill: "#22c55e"
    },
    {
      name: "Puts",
      calls: 0,
      puts: latestPutsChangeOI,
      fill: "#ef4444"
    }
  ]

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
                {oiLoading && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span>OI</span>
                  </div>
                )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing || oiLoading}
                className="text-xs px-2 py-1 h-7"
              >
                <RefreshCw className={`w-3 h-3 ${(isRefreshing || oiLoading) ? 'animate-spin' : ''}`} />
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
            {/* Chart Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Chart & OI Analytics Controls
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChartControlsCollapsed(!chartControlsCollapsed)}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    {chartControlsCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              {!chartControlsCollapsed && (
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

                {/* OI Analytics Controls */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">OI Analytics:</Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Interval:</Label>
                      <Select value={oiInterval} onValueChange={setOiInterval}>
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1m</SelectItem>
                          <SelectItem value="3">3m</SelectItem>
                          <SelectItem value="5">5m</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Expiry Date Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Expiry Date:</Label>
                    <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                      <SelectTrigger className="w-full h-8">
                        <SelectValue placeholder="Select expiry date" />
                      </SelectTrigger>
                      <SelectContent>
                        {expiryOptions.map((expiry) => (
                          <SelectItem key={expiry.expiry} value={expiry.expiry}>
                            {new Date(expiry.expiry).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Default Strike Range Controls */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Default Strike Range:</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Start</Label>
                          <Input
                            type="number"
                            value={defaultStartStrike}
                            onChange={(e) => setDefaultStartStrike(e.target.value)}
                            placeholder="24650"
                            className="w-full h-8"
                            min="20000"
                            max="30000"
                            step="50"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">End</Label>
                          <Input
                            type="number"
                            value={defaultEndStrike}
                            onChange={(e) => setDefaultEndStrike(e.target.value)}
                            placeholder="25600"
                            className="w-full h-8"
                            min="20000"
                            max="30000"
                            step="50"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Range: {defaultStartStrike} - {defaultEndStrike} ({Math.floor((parseInt(defaultEndStrike) - parseInt(defaultStartStrike)) / 50) + 1} strikes)
                      </div>
                    </div>

                </div>
                </CardContent>
              )}
            </Card>

            {/* Live Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  NIFTY Intraday Chart with Gann Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className={`${chartControlsCollapsed ? 'h-[480px]' : 'h-96'} w-full relative transition-all duration-300`}>
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

            {/* OI Analytics Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Calls vs Puts Change OI Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Latest CE/PE Change OI</CardTitle>
                </CardHeader>
                <CardContent>
                  {oiLoading ? (
                    <div className="flex items-center justify-center h-72 text-muted-foreground">
                      Loading OI data...
                    </div>
                  ) : (
                    <>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={callsPutsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              formatter={(value: any, name: string, props: any) => {
                                if (name === "Calls Change OI" && props.payload.calls !== 0) {
                                  const callsValue = props.payload.calls
                                  const sign = callsValue < 0 ? '-' : ''
                                  const lakhsValue = callsValue / 100000
                                  return [`${sign}${formatNumber(Math.abs(lakhsValue), 1)}L`, "Calls Change OI"]
                                } else if (name === "Puts Change OI" && props.payload.puts !== 0) {
                                  const putsValue = props.payload.puts
                                  const sign = putsValue < 0 ? '-' : ''
                                  const lakhsValue = putsValue / 100000
                                  return [`${sign}${formatNumber(Math.abs(lakhsValue), 1)}L`, "Puts Change OI"]
                                }
                                return [null, null]
                              }}
                            />
                            <Bar dataKey="calls" fill="#22c55e" name="Calls Change OI" />
                            <Bar dataKey="puts" fill="#ef4444" name="Puts Change OI" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground text-center">
                        Latest Calls Change OI: {latestCallsChangeOI < 0 ? '-' : ''}{formatNumber(Math.abs(latestCallsChangeOI) / 100000, 1)}L | Latest Puts Change OI: {latestPutsChangeOI < 0 ? '-' : ''}{formatNumber(Math.abs(latestPutsChangeOI) / 100000, 1)}L
                      </div>

                      {/* Chart Legend */}
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-green-600"></div>
                          <span>Calls Change OI</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-red-600"></div>
                          <span>Puts Change OI</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Change OI vs Index Price */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Change OI vs Index Price</CardTitle>
                </CardHeader>
                <CardContent>
                  {oiLoading ? (
                    <div className="flex items-center justify-center h-72 text-muted-foreground">
                      Loading time series data...
                    </div>
                  ) : timeSeriesData.length === 0 ? (
                    <div className="flex items-center justify-center h-72 text-muted-foreground">
                      No time series data available for selected parameters
                    </div>
                  ) : (
                    <>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis
                              dataKey="time"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                            />
                            <Tooltip
                              formatter={(value: any, name: string, props: any) => {
                                if (name === "CE Change") {
                                  const ceValue = props.payload.callChangeOI
                                  const sign = ceValue < 0 ? '-' : ''
                                  return [`${sign}${formatNumber(Math.abs(ceValue), 0)}`, "CE Change"]
                                } else if (name === "PE Change") {
                                  const peValue = props.payload.putChangeOI
                                  const sign = peValue < 0 ? '-' : ''
                                  return [`${sign}${formatNumber(Math.abs(peValue), 0)}`, "PE Change"]
                                }
                                return [formatNumber(value, 2), name]
                              }}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="callChangeOI"
                              stroke="#22c55e"
                              strokeWidth={2}
                              name="CE Change"
                              dot={false}
                              activeDot={{ r: 4, fill: '#22c55e' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="putChangeOI"
                              stroke="#ef4444"
                              strokeWidth={2}
                              name="PE Change"
                              dot={false}
                              activeDot={{ r: 4, fill: '#ef4444' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Chart Legend */}
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-green-600"></div>
                          <span>CE (Calls) Change OI</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-red-600"></div>
                          <span>PE (Puts) Change OI</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Levels Panel - Takes 1/3 on large screens */}
          <div className="space-y-6">
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

            {/* Enhanced Strategy Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Gann Strategy Analysis
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStrategyInfo(!showStrategyInfo)}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </CardTitle>
                {showStrategyInfo && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Gann Strategy Logic</h4>
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <div><strong>Basis:</strong> Gann Square of 9 levels from last NIFTY closing price</div>
                      <div><strong>PUT BUY:</strong> When NIFTY falls below S1</div>
                      <div><strong>CALL BUY:</strong> When NIFTY rises above R1</div>
                      <div><strong>Targets:</strong> S1→S2→S3→S4→S5 (PUT) or R1→R2→R3→R4→R5 (CALL)</div>
                      <div><strong>Stop Loss:</strong> Previous target becomes stop loss</div>
                      <div><strong>Wait Zone:</strong> Between S1 and R1 - wait for breakout</div>
                    </div>
                  </div>
                )}
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


          </div>
        </div>
      </div>
    </div>
  )
}
