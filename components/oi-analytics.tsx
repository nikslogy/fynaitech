"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useState, useEffect } from "react"
import { fetchOITimeRangeData, getSymbolForAPI, OITimeRangeData, formatNumber, generateStrikePrices } from "@/lib/api"

interface OIAnalyticsProps {
  instrument: string
  expiry: string
  timeframe: string
  strikeRange: string
  strikeMode?: string
}

export default function OIAnalytics({ instrument, expiry, timeframe, strikeRange, strikeMode }: OIAnalyticsProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [timeRangeFilter, setTimeRangeFilter] = useState("full-session")
  const [customStartTime, setCustomStartTime] = useState("09:15")
  const [customEndTime, setCustomEndTime] = useState("15:30")
  const [oiData, setOiData] = useState<OITimeRangeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Process OI data for display
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
      callOI: Math.round(item.calls_oi / 1000), // Convert to thousands
      putOI: Math.round(item.puts_oi / 1000),
      totalOI: Math.round((item.calls_oi + item.puts_oi) / 1000),
      maxPain: false // Will be calculated based on max pain API
    })).sort((a, b) => a.strike - b.strike)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const symbolForAPI = getSymbolForAPI(instrument)
        
        const startTime = timeRangeFilter === "custom" ? `${customStartTime}:00` : "09:10:00"
        const endTime = timeRangeFilter === "custom" ? `${customEndTime}:00` : "15:30:00"
        
        console.log('Fetching OI time range data with params:', {
          symbol: symbolForAPI,
          startTime,
          endTime,
          expiry: ''
        })
        
        const rawData = await fetchOITimeRangeData(
          symbolForAPI,
          startTime,
          endTime,
          '' // Empty expiry parameter as shown in API response
        )
        
        console.log('Received OI time range data:', rawData.length, 'items')
        setOiData(rawData)
      } catch (err) {
        console.error('Error fetching OI data:', err)
        setError('Failed to load OI data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [instrument, expiry, timeframe, strikeRange, strikeMode, timeRangeFilter, customStartTime, customEndTime])

  const strikeWiseData = processOIData(oiData)

  const callsPutsData = [
    { name: "Calls OI", value: strikeWiseData.reduce((sum, item) => sum + item.callOI, 0), fill: "#ef4444" },
    { name: "Puts OI", value: strikeWiseData.reduce((sum, item) => sum + item.putOI, 0), fill: "#22c55e" },
  ]

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

  const filteredData = strikeWiseData.filter((item) => {
    if (selectedFilter === "all") return true
    // Add filtering logic based on OI values
    if (selectedFilter === "high-oi") return item.totalOI > 100
    if (selectedFilter === "low-oi") return item.totalOI <= 100
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

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                <SelectTrigger className="w-full sm:w-48">
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

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Signals</SelectItem>
                  <SelectItem value="bullish">Bullish</SelectItem>
                  <SelectItem value="bearish">Bearish</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
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
            <div className="mb-1">
              <strong>Time Range:</strong>{" "}
              {timeRangeFilter === "full-session"
                ? "9:15 AM - 3:30 PM"
                : timeRangeFilter === "morning"
                  ? "9:15 AM - 12:00 PM"
                  : timeRangeFilter === "afternoon"
                    ? "12:00 PM - 3:30 PM"
                    : timeRangeFilter === "opening"
                      ? "9:15 AM - 10:00 AM"
                      : timeRangeFilter === "closing"
                        ? "2:30 PM - 3:30 PM"
                        : `${customStartTime} - ${customEndTime}`}
            </div>
            <div>
              <strong>Strike Range:</strong> {strikeRange}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Calls vs Puts OI Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={callsPutsData}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {callsPutsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Strike-wise OI Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strikeWiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strike" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="callOI" fill="#ef4444" name="Call OI" />
                  <Bar dataKey="putOI" fill="#22c55e" name="Put OI" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">OI Build-up Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center min-w-[80px]">Strike</TableHead>
                    <TableHead className="text-center min-w-[100px]">Call OI (K)</TableHead>
                    <TableHead className="text-center min-w-[100px]">Put OI (K)</TableHead>
                    <TableHead className="text-center min-w-[100px]">Total OI (K)</TableHead>
                    <TableHead className="text-center min-w-[80px]">Max Pain</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-center">{formatNumber(row.strike, 0)}</TableCell>
                      <TableCell className="text-center font-medium text-red-600">
                        {formatNumber(row.callOI, 0)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-green-600">
                        {formatNumber(row.putOI, 0)}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {formatNumber(row.totalOI, 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={row.maxPain ? "default" : "outline"}
                          className={row.maxPain ? "bg-yellow-100 text-yellow-800" : ""}
                        >
                          {row.maxPain ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
