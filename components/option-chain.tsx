"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, BarChart3, Loader2 } from "lucide-react"
import { fetchOptionChainCalculatorData, fetchFutureExpiryData, OptionChainData, FutureExpiryData } from "@/lib/api"

interface OptionChainProps {
  instrument: string
  expiry: string
  timeframe: string
  strikeRange: string
  strikeMode?: string
  refreshKey?: number
}

interface OptionData {
  strike: number
  callOIChg: number
  callOILakh: number
  callOI: number
  callLTP: number
  callVolume: number
  callDelta: number
  callGamma: number
  callTheta: number
  callVega: number
  iv: number
  putLTP: number
  putOI: number
  putOILakh: number
  putOIChg: number
  putVolume: number
  putDelta: number
  putGamma: number
  putTheta: number
  putVega: number
  isATM?: boolean
}

export default function OptionChain({ instrument, expiry, timeframe, strikeRange, strikeMode, refreshKey }: OptionChainProps) {
  const [viewMode, setViewMode] = useState("standard")
  const [showGreeks, setShowGreeks] = useState(false)
  const [showVolume, setShowVolume] = useState(true)
  const [optionData, setOptionData] = useState<OptionChainData[]>([])
  const [futureData, setFutureData] = useState<FutureExpiryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExpiry, setSelectedExpiry] = useState(expiry || "")

  // Fetch option chain data and future data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch both option chain data and future expiry data in parallel
        const [optionChainData, futureDataResult] = await Promise.all([
          fetchOptionChainCalculatorData(
            instrument.toLowerCase(),
            undefined,
            "09:20:00",
            "20",
            "20"
          ),
          fetchFutureExpiryData(instrument.toLowerCase())
        ])

        setOptionData(optionChainData)
        setFutureData(futureDataResult)

        // Set default expiry immediately after data is loaded
        if (futureDataResult.length > 0) {
          const uniqueExpiries = [...new Set(futureDataResult.map(item => item.expiry))]
          if (uniqueExpiries.length > 0) {
            setSelectedExpiry(uniqueExpiries[0])
          }
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [instrument, refreshKey])


  // More robust expiry matching
  let selectedFuture = null

  if (futureData.length > 0) {
    // First try to find by selectedExpiry
    if (selectedExpiry) {
      selectedFuture = futureData.find(future => {
        const futureExpiry = future.expiry
        const selectedExpiryFormatted = selectedExpiry

        // Try exact match first
        if (futureExpiry === selectedExpiryFormatted) return true

        // Try date format matching (remove time part if present)
        const futureExpiryDate = futureExpiry.split('T')[0]
        const selectedExpiryDate = selectedExpiryFormatted.split('T')[0]

        return futureExpiryDate === selectedExpiryDate
      })
    }

    // If no match found, use the first available future as fallback
    if (!selectedFuture) {
      selectedFuture = futureData[0]
    }
  }

  const futuresData = selectedFuture ? {
    price: selectedFuture.last_price,
    change: Number((selectedFuture.last_price - selectedFuture.prev_close).toFixed(2)),
    changePercent: Number((((selectedFuture.last_price - selectedFuture.prev_close) / selectedFuture.prev_close) * 100).toFixed(2)),
  } : futureData.length > 0 ? {
    // Use first available future as fallback if selectedFuture is not found
    price: futureData[0].last_price,
    change: Number((futureData[0].last_price - futureData[0].prev_close).toFixed(2)),
    changePercent: Number((((futureData[0].last_price - futureData[0].prev_close) / futureData[0].prev_close) * 100).toFixed(2)),
  } : {
    price: 0,
    change: 0,
    changePercent: 0,
  }

  // Filter data by selected expiry (client-side filtering) with robust matching
  const expiryFilteredData = (selectedExpiry && optionData.length > 0)
    ? optionData.filter(item => {
        const optionExpiry = item.expiry_date
        const selectedExpiryFormatted = selectedExpiry

        // Try exact match first
        if (optionExpiry === selectedExpiryFormatted) return true

        // Try date format matching (remove time part if present)
        const optionExpiryDate = optionExpiry?.split('T')[0]
        const selectedExpiryDate = selectedExpiryFormatted?.split('T')[0]

        return optionExpiryDate === selectedExpiryDate
      })
    : optionData

  // Use expiry filtered data, or fallback to all data if filtering results in empty
  const finalOptionData = expiryFilteredData.length > 0 ? expiryFilteredData :
                         (optionData.length > 0 ? optionData : [])


  // Transform API data to component format
  const transformedOptionData: OptionData[] = finalOptionData.map((item, index) => {
    // Use the selected future's last_price as the current price for ATM calculation
    const currentPrice = selectedFuture?.last_price || futureData[0]?.last_price || item.index_close
    const isATM = Math.abs(currentPrice - item.strike_price) < 50
    return {
      strike: item.strike_price,
      callOIChg: item.calls_change_oi,
      callOILakh: item.calls_oi / 100000, // Convert to lakhs
      callOI: item.calls_oi,
      callLTP: item.calls_ltp,
      callVolume: item.calls_volume,
      callDelta: item.call_delta,
      callGamma: item.call_gamma,
      callTheta: item.call_theta,
      callVega: item.call_vega,
      iv: item.calls_iv,
      putLTP: item.puts_ltp,
      putOI: item.puts_oi,
      putOILakh: item.puts_oi / 100000, // Convert to lakhs
      putOIChg: item.puts_change_oi,
      putVolume: item.puts_volume,
      putDelta: item.put_delta,
      putGamma: item.put_gamma,
      putTheta: item.put_theta,
      putVega: item.put_vega,
      isATM: isATM,
    }
  })


  const maxCallOI = transformedOptionData.length > 0 ? Math.max(...transformedOptionData.map((d) => d.callOI)) : 0
  const maxPutOI = transformedOptionData.length > 0 ? Math.max(...transformedOptionData.map((d) => d.putOI)) : 0
  const maxCallVolume = transformedOptionData.length > 0 ? Math.max(...transformedOptionData.map((d) => d.callVolume)) : 0
  const maxPutVolume = transformedOptionData.length > 0 ? Math.max(...transformedOptionData.map((d) => d.putVolume)) : 0

  const getOIBarWidth = (oi: number, maxOI: number) => {
    return Math.max((oi / maxOI) * 100, 2)
  }

  const getVolumeBarWidth = (volume: number, maxVolume: number) => {
    return Math.max((volume / maxVolume) * 100, 2)
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-yellow-600"
  }

  const filterStrikesByRange = (data: OptionData[]) => {
    if (strikeMode === "range") {
      const [start, end] = strikeRange.split("-").map(Number)
      return data.filter((d) => d.strike >= start && d.strike <= end)
    } else if (strikeMode === "custom") {
      const customStrikes = strikeRange.split(",").map(Number)
      return data.filter((d) => customStrikes.includes(d.strike))
    } else {
      // Default ATM± logic
      if (strikeRange === "ALL") {
        return data
      }

      // Find ATM strike from selected future data
      const atmStrike = selectedFuture?.last_price || futureData[0]?.last_price || 25100
      const range = Number.parseInt(strikeRange.replace("ATM±", ""))
      const minStrike = atmStrike - range * 50
      const maxStrike = atmStrike + range * 50

      return data.filter((d) => d.strike >= minStrike && d.strike <= maxStrike)
    }
  }

  const filteredData = filterStrikesByRange(transformedOptionData)

  // If filtered data is empty, show all data
  const displayData = filteredData.length > 0 ? filteredData : transformedOptionData

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading option chain data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-red-600 font-medium">Error loading option chain data</p>
              <p className="text-muted-foreground text-sm">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Futures Context Header */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg">
            {instrument} Futures • {timeframe}min Timeframe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Current Price</p>
              <p className="text-lg sm:text-2xl font-bold">{futuresData.price.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Change</p>
              <p
                className={`text-sm sm:text-xl font-semibold ${futuresData.change > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {futuresData.change > 0 ? "+" : ""}
                {futuresData.change} ({futuresData.changePercent > 0 ? "+" : ""}
                {futuresData.changePercent}%)
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Expiry</p>
              <Badge variant="outline" className="text-xs">
                {new Date(selectedExpiry).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Timeframe</p>
              <Badge variant="secondary" className="text-xs">
                {timeframe}min
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col space-y-2">
            <CardTitle className="text-base sm:text-lg">Option Chain</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Expiry:</span>
                <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {futureData.length > 0 ? (
                      [...new Set(futureData.map(item => item.expiry))].map((expiryDate) => {
                        const formattedDate = new Date(expiryDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                        return (
                          <SelectItem key={expiryDate} value={expiryDate}>
                            {formattedDate}
                          </SelectItem>
                        )
                      })
                    ) : (
                      <SelectItem value="" disabled>Loading expiry dates...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-28 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="greeks">Greeks View</SelectItem>
                  <SelectItem value="ltp">LTP Focus</SelectItem>
                  <SelectItem value="all">All Columns</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showVolume ? "default" : "outline"}
                size="sm"
                onClick={() => setShowVolume(!showVolume)}
                className="text-xs"
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Volume</span>
                <span className="sm:hidden">Vol</span>
              </Button>

              <Button
                variant={showGreeks ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGreeks(!showGreeks)}
                className="text-xs"
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Greeks</span>
                <span className="sm:hidden">Grk</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto max-h-[80vh] overflow-y-auto border rounded-lg">
            <div className="min-w-[900px] lg:min-w-full">
              {/* Sticky header section */}
              <div className="sticky top-0 bg-background z-20 border-b">
                <div className="grid grid-cols-2 gap-4 py-3 mb-2 bg-background">
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-bold text-red-600 bg-red-50 dark:bg-red-950 py-2 px-4 rounded">
                      CALLS
                    </h3>
                  </div>
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-bold text-green-600 bg-green-50 dark:bg-green-950 py-2 px-4 rounded">
                      PUTS
                    </h3>
                  </div>
                </div>

                {/* Column headers - always visible */}
                <div
                  className={`grid gap-1 text-xs font-medium text-muted-foreground px-2 py-3 bg-background/95 backdrop-blur-sm border-b sticky top-[72px] z-10 ${
                    viewMode === "all" || showGreeks
                      ? "grid-cols-15"
                      : viewMode === "ltp"
                        ? "grid-cols-7"
                        : "grid-cols-11"
                  }`}
                >
                  <div className="text-center">OI Chg%</div>
                  <div className="text-center">OI-lakh</div>
                  <div className="text-center">Call OI</div>
                  {showVolume && <div className="text-center">Volume</div>}
                  <div className="text-center">LTP</div>
                  {(showGreeks || viewMode === "greeks" || viewMode === "all") && (
                    <>
                      <div className="text-center">Delta</div>
                      <div className="text-center">Gamma</div>
                      <div className="text-center">Theta</div>
                      <div className="text-center">Vega</div>
                    </>
                  )}
                  <div className="text-center font-bold text-foreground bg-blue-100 dark:bg-blue-900 rounded px-2 py-1">
                    Strike
                  </div>
                  <div className="text-center">IV</div>
                  <div className="text-center">LTP</div>
                  {showVolume && <div className="text-center">Volume</div>}
                  <div className="text-center">Put OI</div>
                  <div className="text-center">OI-lakh</div>
                  <div className="text-center">OI Chg%</div>
                </div>
              </div>

              {/* Data rows */}
              <div className="space-y-1 p-2">
                {displayData.map((row) => (
                  <div
                    key={row.strike}
                    className={`grid gap-1 py-2 px-2 text-xs sm:text-sm border-b hover:bg-muted/30 rounded-sm transition-colors ${
                      row.isATM ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200" : ""
                    } ${
                      viewMode === "all" || showGreeks
                        ? "grid-cols-15"
                        : viewMode === "ltp"
                          ? "grid-cols-7"
                          : "grid-cols-11"
                    }`}
                  >
                    {/* Call Side */}
                    <div className={`text-center font-medium ${getChangeColor(row.callOIChg)}`}>
                      {row.callOIChg > 0 ? "+" : ""}
                      {row.callOIChg}%
                    </div>
                    <div className="text-center text-xs">{row.callOILakh}</div>
                    <div className="text-center relative">
                      <div className="relative h-6 flex items-center justify-end">
                        <div
                          className="absolute right-0 h-4 bg-red-400 opacity-60 rounded-sm"
                          style={{ width: `${getOIBarWidth(row.callOI, maxCallOI)}%` }}
                        ></div>
                        <span className="relative z-10 text-xs font-medium px-1">{row.callOI.toFixed(2)}</span>
                      </div>
                    </div>

                    {showVolume && (
                      <div className="text-center relative">
                        <div className="relative h-6 flex items-center justify-end">
                          <div
                            className="absolute right-0 h-4 bg-red-300 opacity-40 rounded-sm"
                            style={{ width: `${getVolumeBarWidth(row.callVolume, maxCallVolume)}%` }}
                          ></div>
                          <span className="relative z-10 text-xs px-1">{row.callVolume.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center font-medium">{row.callLTP.toFixed(2)}</div>

                    {(showGreeks || viewMode === "greeks" || viewMode === "all") && (
                      <>
                        <div className="text-center text-xs">{row.callDelta.toFixed(3)}</div>
                        <div className="text-center text-xs">{row.callGamma.toFixed(3)}</div>
                        <div className="text-center text-xs">{row.callTheta.toFixed(1)}</div>
                        <div className="text-center text-xs">{row.callVega.toFixed(1)}</div>
                      </>
                    )}

                    {/* Strike Price */}
                    <div
                      className={`text-center font-bold ${row.isATM ? "text-blue-600 text-sm sm:text-base bg-blue-100 dark:bg-blue-900 rounded px-2 py-1" : ""}`}
                    >
                      {row.strike}
                    </div>

                    {/* Put Side */}
                    <div className="text-center text-xs">{row.iv}</div>
                    <div className="text-center font-medium">{row.putLTP.toFixed(2)}</div>

                    {showVolume && (
                      <div className="text-center relative">
                        <div className="relative h-6 flex items-center justify-start">
                          <div
                            className="absolute left-0 h-4 bg-green-300 opacity-40 rounded-sm"
                            style={{ width: `${getVolumeBarWidth(row.putVolume, maxPutVolume)}%` }}
                          ></div>
                          <span className="relative z-10 text-xs px-1">{row.putVolume.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center relative">
                      <div className="relative h-6 flex items-center justify-start">
                        <div
                          className="absolute left-0 h-4 bg-green-400 opacity-60 rounded-sm"
                          style={{ width: `${getOIBarWidth(row.putOI, maxPutOI)}%` }}
                        ></div>
                        <span className="relative z-10 text-xs font-medium px-1">{row.putOI.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-center text-xs">{row.putOILakh}</div>
                    <div className={`text-center font-medium ${getChangeColor(row.putOIChg)}`}>
                      {row.putOIChg > 0 ? "+" : ""}
                      {row.putOIChg}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-red-600 mb-2 text-sm sm:text-base">Total Call OI</h4>
                <p className="text-xl sm:text-2xl font-bold">
                  {displayData.reduce((sum, d) => sum + d.callOI, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Change: {displayData.reduce((sum, d) => sum + d.callOIChg, 0) > 0 ? '+' : ''}{displayData.reduce((sum, d) => sum + d.callOIChg, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-600 mb-2 text-sm sm:text-base">Total Put OI</h4>
                <p className="text-xl sm:text-2xl font-bold">
                  {displayData.reduce((sum, d) => sum + d.putOI, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Change: {displayData.reduce((sum, d) => sum + d.putOIChg, 0) > 0 ? '+' : ''}{displayData.reduce((sum, d) => sum + d.putOIChg, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
