"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, BarChart3 } from "lucide-react"

interface OptionChainProps {
  instrument: string
  expiry: string
  timeframe: string
  strikeRange: string
  strikeMode?: string
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

export default function OptionChain({ instrument, expiry, timeframe, strikeRange, strikeMode }: OptionChainProps) {
  const [viewMode, setViewMode] = useState("standard")
  const [showGreeks, setShowGreeks] = useState(false)
  const [showVolume, setShowVolume] = useState(true)

  // Mock data matching the image format
  const futuresData = {
    price: instrument === "NIFTY" ? 25100 : 47250.3,
    change: instrument === "NIFTY" ? 125.5 : -85.2,
    changePercent: instrument === "NIFTY" ? 0.58 : -0.18,
  }

  const optionData: OptionData[] = [
    {
      strike: 24800,
      callOIChg: -26,
      callOILakh: 9.3,
      callOI: 306,
      callLTP: 306.0,
      callVolume: 1250,
      callDelta: 0.85,
      callGamma: 0.002,
      callTheta: -12.5,
      callVega: 8.2,
      iv: 15.4,
      putLTP: 5.95,
      putOI: 127,
      putOILakh: 127.4,
      putOIChg: 24,
      putVolume: 850,
      putDelta: -0.15,
      putGamma: 0.002,
      putTheta: -8.1,
      putVega: 8.2,
    },
    {
      strike: 24850,
      callOIChg: -24,
      callOILakh: 4.3,
      callOI: 256,
      callLTP: 256.5,
      callVolume: 980,
      callDelta: 0.78,
      callGamma: 0.003,
      callTheta: -15.2,
      callVega: 9.1,
      iv: 14.0,
      putLTP: 7.25,
      putOI: 66,
      putOILakh: 66.6,
      putOIChg: 39,
      putVolume: 1200,
      putDelta: -0.22,
      putGamma: 0.003,
      putTheta: -9.8,
      putVega: 9.1,
    },
    {
      strike: 24900,
      callOIChg: -17,
      callOILakh: 14.3,
      callOI: 208,
      callLTP: 208.15,
      callVolume: 1500,
      callDelta: 0.72,
      callGamma: 0.004,
      callTheta: -17.8,
      callVega: 10.3,
      iv: 12.7,
      putLTP: 9.4,
      putOI: 114,
      putOILakh: 114.7,
      putOIChg: 7,
      putVolume: 1400,
      putDelta: -0.3,
      putGamma: 0.004,
      putTheta: -16.4,
      putVega: 10.3,
    },
    {
      strike: 24950,
      callOIChg: 0.7,
      callOILakh: 9.4,
      callOI: 163,
      callLTP: 163.0,
      callVolume: 1800,
      callDelta: 0.67,
      callGamma: 0.005,
      callTheta: -19.1,
      callVega: 11.4,
      iv: 11.6,
      putLTP: 12.85,
      putOI: 81,
      putOILakh: 81.7,
      putOIChg: 8,
      putVolume: 1600,
      putDelta: -0.35,
      putGamma: 0.005,
      putTheta: -15.7,
      putVega: 11.4,
    },
    {
      strike: 25000,
      callOIChg: 8,
      callOILakh: 58.1,
      callOI: 117,
      callLTP: 117.85,
      callVolume: 2100,
      callDelta: 0.62,
      callGamma: 0.006,
      callTheta: -20.4,
      callVega: 12.5,
      iv: 10.5,
      putLTP: 18.65,
      putOI: 204,
      putOILakh: 204.2,
      putOIChg: 14,
      putVolume: 2200,
      putDelta: -0.4,
      putGamma: 0.006,
      putTheta: -14.9,
      putVega: 12.5,
    },
    {
      strike: 25050,
      callOIChg: 105,
      callOILakh: 44.6,
      callOI: 77,
      callLTP: 77.4,
      callVolume: 2400,
      callDelta: 0.57,
      callGamma: 0.007,
      callTheta: -21.7,
      callVega: 13.6,
      iv: 9.4,
      putLTP: 28.25,
      putOI: 109,
      putOILakh: 109.9,
      putOIChg: 43,
      putVolume: 2500,
      putDelta: -0.45,
      putGamma: 0.007,
      putTheta: -14.0,
      putVega: 13.6,
    },
    {
      strike: 25100,
      callOIChg: 147,
      callOILakh: 203.1,
      callOI: 45,
      callLTP: 45.6,
      callVolume: 2700,
      callDelta: 0.52,
      callGamma: 0.008,
      callTheta: -18.5,
      callVega: 15.2,
      iv: 8.7,
      putLTP: 45.1,
      putOI: 168,
      putOILakh: 168.7,
      putOIChg: 36,
      putVolume: 2800,
      putDelta: -0.48,
      putGamma: 0.008,
      putTheta: -18.1,
      putVega: 15.2,
      isATM: true,
    },
    {
      strike: 25150,
      callOIChg: 101,
      callOILakh: 123.6,
      callOI: 25,
      callLTP: 25.8,
      callVolume: 3000,
      callDelta: 0.47,
      callGamma: 0.009,
      callTheta: -19.8,
      callVega: 16.8,
      iv: 8.9,
      putLTP: 75.75,
      putOI: 33,
      putOILakh: 33.4,
      putOIChg: -12,
      putVolume: 3100,
      putDelta: -0.53,
      putGamma: 0.009,
      putTheta: -17.2,
      putVega: 16.8,
    },
    {
      strike: 25200,
      callOIChg: 66,
      callOILakh: 165.8,
      callOI: 14,
      callLTP: 14.1,
      callVolume: 3300,
      callDelta: 0.42,
      callGamma: 0.01,
      callTheta: -20.9,
      callVega: 18.1,
      iv: 9.3,
      putLTP: 114.05,
      putOI: 25,
      putOILakh: 25.8,
      putOIChg: -25,
      putVolume: 3400,
      putDelta: -0.58,
      putGamma: 0.01,
      putTheta: -18.3,
      putVega: 18.1,
    },
    {
      strike: 25250,
      callOIChg: 85,
      callOILakh: 83.8,
      callOI: 7,
      callLTP: 7.55,
      callVolume: 3600,
      callDelta: 0.37,
      callGamma: 0.011,
      callTheta: -22.0,
      callVega: 19.4,
      iv: 11.4,
      putLTP: 203.3,
      putOI: 4,
      putOILakh: 4.5,
      putOIChg: -30,
      putVolume: 3700,
      putDelta: -0.63,
      putGamma: 0.011,
      putTheta: -21.6,
      putVega: 19.4,
    },
    {
      strike: 25300,
      callOIChg: 34,
      callOILakh: 119.9,
      callOI: 4,
      callLTP: 4.65,
      callVolume: 3900,
      callDelta: 0.32,
      callGamma: 0.012,
      callTheta: -23.1,
      callVega: 20.7,
      iv: 12.5,
      putLTP: 251.65,
      putOI: 6,
      putOILakh: 6.8,
      putOIChg: -42,
      putVolume: 4000,
      putDelta: -0.68,
      putGamma: 0.012,
      putTheta: -22.7,
      putVega: 20.7,
    },
    {
      strike: 25350,
      callOIChg: 42,
      callOILakh: 78.0,
      callOI: 3,
      callLTP: 3.05,
      callVolume: 4200,
      callDelta: 0.27,
      callGamma: 0.013,
      callTheta: -24.2,
      callVega: 22.0,
      iv: 13.5,
      putLTP: 350.6,
      putOI: 1,
      putOILakh: 1.1,
      putOIChg: -13,
      putVolume: 4300,
      putDelta: -0.73,
      putGamma: 0.013,
      putTheta: -23.9,
      putVega: 22.0,
    },
    {
      strike: 25400,
      callOIChg: 72,
      callOILakh: 108.6,
      callOI: 2,
      callLTP: 2.25,
      callVolume: 4500,
      callDelta: 0.22,
      callGamma: 0.014,
      callTheta: -25.3,
      callVega: 23.3,
      iv: 12.5,
      putLTP: 301.15,
      putOI: 1,
      putOILakh: 1.9,
      putOIChg: -25,
      putVolume: 4600,
      putDelta: -0.78,
      putGamma: 0.014,
      putTheta: -22.7,
      putVega: 23.3,
    },
    {
      strike: 25450,
      callOIChg: 21,
      callOILakh: 56.4,
      callOI: 1,
      callLTP: 1.7,
      callVolume: 4800,
      callDelta: 0.17,
      callGamma: 0.015,
      callTheta: -26.4,
      callVega: 24.6,
      iv: 13.5,
      putLTP: 350.6,
      putOI: 0,
      putOILakh: 0.3,
      putOIChg: -47,
      putVolume: 4900,
      putDelta: -0.83,
      putGamma: 0.015,
      putTheta: -23.9,
      putVega: 24.6,
    },
  ]

  const maxCallOI = Math.max(...optionData.map((d) => d.callOI))
  const maxPutOI = Math.max(...optionData.map((d) => d.putOI))
  const maxCallVolume = Math.max(...optionData.map((d) => d.callVolume))
  const maxPutVolume = Math.max(...optionData.map((d) => d.putVolume))

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
      if (strikeRange === "ALL") return data
      const atmStrike = data.find((d) => d.isATM)?.strike || 25100
      const range = Number.parseInt(strikeRange.replace("ATM±", ""))
      const minStrike = atmStrike - range * 50
      const maxStrike = atmStrike + range * 50
      return data.filter((d) => d.strike >= minStrike && d.strike <= maxStrike)
    }
  }

  const filteredData = filterStrikesByRange(optionData)

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
                {expiry}
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
            <CardTitle className="text-base sm:text-lg">Option Chain</CardTitle>

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
                {filteredData.map((row) => (
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
                  {filteredData.reduce((sum, d) => sum + d.callOI, 0).toFixed(0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-600 mb-2 text-sm sm:text-base">Total Put OI</h4>
                <p className="text-xl sm:text-2xl font-bold">
                  {filteredData.reduce((sum, d) => sum + d.putOI, 0).toFixed(0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
