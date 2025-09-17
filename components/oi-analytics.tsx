"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from "recharts"
import { useState, useEffect } from "react"
import { fetchOITimeRangeData, fetchTrendingOIData, getSymbolForAPI, OITimeRangeData, formatNumber, generateStrikePrices } from "@/lib/api"
import { Slider } from "@/components/ui/slider"

interface OIAnalyticsProps {
  instrument: string
  expiry: string
  timeframe: string
  strikeRange: string
  strikeMode?: string
}

export default function OIAnalytics({ instrument, expiry, timeframe, strikeRange, strikeMode }: OIAnalyticsProps) {
  const [timeRangeFilter, setTimeRangeFilter] = useState("full-session")
  const [customStartTime, setCustomStartTime] = useState("09:15")
  const [customEndTime, setCustomEndTime] = useState("15:30")
  const [oiData, setOiData] = useState<OITimeRangeData[]>([])
  const [trendingData, setTrendingData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartRange, setChartRange] = useState([0, 100]) // Start and end percentage of data to show
  const [strikeChartRange, setStrikeChartRange] = useState([0, 100]) // Range for strike-wise chart
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie') // Toggle between pie and bar chart
  const [tableFilter, setTableFilter] = useState("all") // Filter for OI Build-up Analysis table

  // Process OI change data for display
  const processOIData = (rawData: OITimeRangeData[]) => {
    // Group by strike price and get latest data
    const strikeMap = new Map<number, OITimeRangeData>()
    rawData.forEach(item => {
      if (!strikeMap.has(item.strike_price) || new Date(item.time) > new Date(strikeMap.get(item.strike_price)!.time)) {
        strikeMap.set(item.strike_price, item)
      }
    })

    return Array.from(strikeMap.values()).map(item => ({
      strike: item.strike_price,
      callChangeOI: Math.round(item.calls_change_oi), // Preserve sign for proper analysis
      putChangeOI: Math.round(item.puts_change_oi),
      totalChangeOI: Math.round(item.calls_change_oi + item.puts_change_oi),
      callOIValue: Math.round(item.calls_change_oi_value / 1000), // Convert to thousands
      putOIValue: Math.round(item.puts_change_oi_value / 1000),
      totalOIValue: Math.round((item.calls_change_oi_value + item.puts_change_oi_value) / 1000),
      maxPain: false, // Will be calculated based on max pain API
      time: item.time,
      indexClose: item.index_close
    })).sort((a, b) => a.strike - b.strike)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const symbolForAPI = getSymbolForAPI(instrument)

        // Determine time range based on filter
        let startTime = "09:10:00"
        let endTime = "15:30:00"

        if (timeRangeFilter === "morning") {
          startTime = "09:15:00"
          endTime = "12:00:00"
        } else if (timeRangeFilter === "afternoon") {
          startTime = "12:00:00"
          endTime = "15:30:00"
        } else if (timeRangeFilter === "opening") {
          startTime = "09:15:00"
          endTime = "10:00:00"
        } else if (timeRangeFilter === "closing") {
          startTime = "14:30:00"
          endTime = "15:30:00"
        } else if (timeRangeFilter === "custom") {
          startTime = `${customStartTime}:00`
          endTime = `${customEndTime}:00`
        }

        // Fetch strike-wise OI data (change-oi-time-range API)
        const rawOIData = await fetchOITimeRangeData(
          symbolForAPI,
          startTime,
          endTime,
          '' // Empty expiry parameter as shown in API response
        )

        if (!rawOIData || rawOIData.length === 0) {
          console.warn('No OI data received from API')
          setError('No data available for the selected parameters')
          setOiData([])
          setTrendingData([])
          return
        }

        setOiData(rawOIData)

        // Fetch trending OI data for time-series (trending-oi-data API)
        const rawTrendingData = await fetchTrendingOIData(
          symbolForAPI,
          strikeRange,
          expiry,
          timeframe || '3',
          ''
        )

        setTrendingData(rawTrendingData)

      } catch (err) {
        console.error('Error fetching OI data:', err)
        setError(`Failed to load OI data: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setOiData([])
        setTrendingData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [instrument, expiry, timeframe, strikeRange, strikeMode, timeRangeFilter, customStartTime, customEndTime])

  const strikeWiseData = processOIData(oiData)

  // Filter strike-wise data based on chart range
  const strikeStartIndex = Math.floor(strikeWiseData.length * (strikeChartRange[0] / 100))
  const strikeEndIndex = Math.ceil(strikeWiseData.length * (strikeChartRange[1] / 100))
  const filteredStrikeWiseData = strikeWiseData.slice(strikeStartIndex, strikeEndIndex)

  // Calculate total change OI from raw API data for both charts
  const totalCallsChangeOI = oiData.reduce((sum, item) => sum + item.calls_change_oi, 0) / 100000 // Convert to lakhs
  const totalPutsChangeOI = oiData.reduce((sum, item) => sum + item.puts_change_oi, 0) / 100000 // Convert to lakhs

  // Data for both pie and bar charts (same data, different visualization)
  const callsPutsData = [
    { name: "Calls", value: Math.abs(totalCallsChangeOI), fill: "#22c55e" }, // Green for calls
    { name: "Puts", value: Math.abs(totalPutsChangeOI), fill: "#ef4444" }, // Red for puts
  ]

  const callsPutsBarData = [
    {
      name: "Calls",
      calls: totalCallsChangeOI,
      puts: 0,
      fill: "#22c55e", // Green for calls
      callsValue: totalCallsChangeOI,
      putsValue: 0
    },
    {
      name: "Puts",
      calls: 0,
      puts: totalPutsChangeOI,
      fill: "#ef4444", // Red for puts
      callsValue: 0,
      putsValue: totalPutsChangeOI
    },
  ]

  // Prepare data for time-series chart using trending data
  const timeSeriesData = trendingData.map((item) => ({
    time: item.time,
    callChangeOI: item.calls_change_oi || 0,
    putChangeOI: item.puts_change_oi || 0,
    totalChangeOI: item.diff_in_oi || 0,
    indexClose: item.index_close || 0,
    changeOIPCR: item.change_in_oi_pcr || 0,
    volumePCR: item.volume_pcr || 0
  })).sort((a, b) => {
    // Sort by time - convert HH:MM format to comparable numbers
    const [aHours, aMinutes] = a.time.split(':').map(Number)
    const [bHours, bMinutes] = b.time.split(':').map(Number)
    return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes)
  })

  // Filter time series data based on chart range
  const startIndex = Math.floor(timeSeriesData.length * (chartRange[0] / 100))
  const endIndex = Math.ceil(timeSeriesData.length * (chartRange[1] / 100))
  const filteredTimeSeriesData = timeSeriesData.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading OI Analytics data...</div>
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

  // No filtering applied - show all data
  const filteredData = strikeWiseData

  // Filter table data based on table filter
  const filteredTableData = strikeWiseData.filter((item) => {
    if (tableFilter === "all") return true
    if (tableFilter === "high-change") return Math.abs(item.totalChangeOI) > 50000
    if (tableFilter === "positive") return item.callChangeOI > 0 || item.putChangeOI > 0
    if (tableFilter === "negative") return item.callChangeOI < 0 || item.putChangeOI < 0
    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <CardTitle className="text-base sm:text-lg break-words">
              OI Analytics - {instrument} ({timeframe}min)
            </CardTitle>

            <div className="flex gap-3">
              <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-session">Full Session</SelectItem>
                  <SelectItem value="morning">9:15 - 12:00</SelectItem>
                  <SelectItem value="afternoon">12:00 - 15:30</SelectItem>
                  <SelectItem value="opening">9:15 - 10:00</SelectItem>
                  <SelectItem value="closing">14:30 - 15:30</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {timeRangeFilter === "custom" && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time" className="text-sm font-medium mb-2 block">
                    Start Time:
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="w-full"
                    min="09:15"
                    max="15:30"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-sm font-medium mb-2 block">
                    End Time:
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="w-full"
                    min="09:15"
                    max="15:30"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-2 break-words">
            <div>
              <strong>Time Range:</strong>{" "}
              {(() => {
                let startTime = "09:10:00"
                let endTime = "15:30:00"

                if (timeRangeFilter === "morning") {
                  startTime = "09:15:00"
                  endTime = "12:00:00"
                } else if (timeRangeFilter === "afternoon") {
                  startTime = "12:00:00"
                  endTime = "15:30:00"
                } else if (timeRangeFilter === "opening") {
                  startTime = "09:15:00"
                  endTime = "10:00:00"
                } else if (timeRangeFilter === "closing") {
                  startTime = "14:30:00"
                  endTime = "15:30:00"
                } else if (timeRangeFilter === "custom") {
                  startTime = `${customStartTime}:00`
                  endTime = `${customEndTime}:00`
                }

                return `${startTime} - ${endTime}`
              })()}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <CardTitle className="text-base sm:text-lg">Calls vs Puts Change OI Distribution</CardTitle>
              <Badge variant="outline" className="text-xs w-fit">
                Hover for Change OI (Lakhs)
              </Badge>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
                className="text-xs"
              >
                Pie Chart
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="text-xs"
              >
                Bar Chart
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={callsPutsData}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatNumber(Number(value), 2)}L`}
                  >
                    {callsPutsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "Calls"
                        ? `${formatNumber(totalCallsChangeOI, 2)}L`
                        : `${formatNumber(totalPutsChangeOI, 2)}L`,
                      `${name} Change OI`
                    ]}
                  />
                </PieChart>
              ) : (
                <BarChart data={callsPutsBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any, name: string, props: any) => {
                      if (name === "Calls Change OI (Lakhs)" && props.payload.callsValue !== 0) {
                        return [`${formatNumber(props.payload.callsValue, 2)}L`, "Calls Change OI"]
                      } else if (name === "Puts Change OI (Lakhs)" && props.payload.putsValue !== 0) {
                        return [`${formatNumber(props.payload.putsValue, 2)}L`, "Puts Change OI"]
                      }
                      return [null, null]
                    }}
                  />
                  <Bar dataKey="calls" fill="#22c55e" name="Calls Change OI (Lakhs)" />
                  <Bar dataKey="puts" fill="#ef4444" name="Puts Change OI (Lakhs)" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Total Calls Change OI: {formatNumber(totalCallsChangeOI, 2)}L | Total Puts Change OI: {formatNumber(totalPutsChangeOI, 2)}L
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Strike-wise Change OI Distribution</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Showing {filteredStrikeWiseData.length} strikes
                </Label>
                <span className="text-xs text-muted-foreground">
                  Range: {strikeChartRange[0]}% - {strikeChartRange[1]}%
                </span>
              </div>
              <Slider
                value={strikeChartRange}
                onValueChange={setStrikeChartRange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low Strikes</span>
                <span>High Strikes</span>
              </div>
              {filteredStrikeWiseData.length > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  Showing: {filteredStrikeWiseData[0]?.strike} to {filteredStrikeWiseData[filteredStrikeWiseData.length - 1]?.strike}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredStrikeWiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strike" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => formatNumber(value, 0)} />
                  <Bar dataKey="callChangeOI" fill="#22c55e" name="Call Change OI" />
                  <Bar dataKey="putChangeOI" fill="#ef4444" name="Put Change OI" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Change OI vs Index Price</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Time Range: {chartRange[0]}% - {chartRange[1]}%
                </Label>
                <span className="text-xs text-muted-foreground">
                  {filteredTimeSeriesData.length} data points
                </span>
              </div>
              <Slider
                value={chartRange}
                onValueChange={setChartRange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Start (9:15)</span>
                <span>End (15:30)</span>
              </div>
              {filteredTimeSeriesData.length > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  Showing: {filteredTimeSeriesData[0]?.time} to {filteredTimeSeriesData[filteredTimeSeriesData.length - 1]?.time}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 sm:h-80">
              {filteredTimeSeriesData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No time series data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={['dataMin - 10', 'dataMax + 10']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "Index Price" ? formatNumber(value, 2) : formatNumber(value, 0),
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="totalChangeOI"
                      fill="#8884d8"
                      name="Total Change OI"
                      opacity={0.7}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="indexClose"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Index Price"
                      dot={false}
                      activeDot={{ r: 3, fill: '#22c55e' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">OI Build-up Analysis</CardTitle>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strikes</SelectItem>
                  <SelectItem value="high-change">High Change OI</SelectItem>
                  <SelectItem value="positive">Positive Only</SelectItem>
                  <SelectItem value="negative">Negative Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredTableData.length} strikes • Values in Lakhs (L)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center min-w-[80px]">Strike</TableHead>
                    <TableHead className="text-center min-w-[100px]">Call Change OI (L)</TableHead>
                    <TableHead className="text-center min-w-[100px]">Put Change OI (L)</TableHead>
                    <TableHead className="text-center min-w-[100px]">Total Change OI (L)</TableHead>
                    <TableHead className="text-center min-w-[100px]">Call OI Value (L)</TableHead>
                    <TableHead className="text-center min-w-[100px]">Put OI Value (L)</TableHead>
                    <TableHead className="text-center min-w-[80px]">Index Close</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No data available for the selected filter
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-center">{formatNumber(row.strike, 0)}</TableCell>
                        <TableCell className={`text-center font-medium ${
                          row.callChangeOI > 0 ? "text-green-600" : row.callChangeOI < 0 ? "text-red-600" : "text-gray-600"
                        }`}>
                          {row.callChangeOI > 0 ? "+" : ""}{formatNumber(row.callChangeOI / 100000, 2)}L
                        </TableCell>
                        <TableCell className={`text-center font-medium ${
                          row.putChangeOI > 0 ? "text-green-600" : row.putChangeOI < 0 ? "text-red-600" : "text-gray-600"
                        }`}>
                          {row.putChangeOI > 0 ? "+" : ""}{formatNumber(row.putChangeOI / 100000, 2)}L
                        </TableCell>
                        <TableCell className={`text-center font-medium ${
                          row.totalChangeOI > 0 ? "text-green-600" : row.totalChangeOI < 0 ? "text-red-600" : "text-gray-600"
                        }`}>
                          {row.totalChangeOI > 0 ? "+" : ""}{formatNumber(row.totalChangeOI / 100000, 2)}L
                        </TableCell>
                        <TableCell className="text-center font-medium text-blue-600">
                          {formatNumber(row.callOIValue, 2)}L
                        </TableCell>
                        <TableCell className="text-center font-medium text-purple-600">
                          {formatNumber(row.putOIValue, 2)}L
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {formatNumber(row.indexClose, 2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
