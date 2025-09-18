"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts"
import { Slider } from "@/components/ui/slider"
import { fetchTrendingOIData, fetchPCRData, fetchTodaySpotData, getSymbolForAPI, TrendingOIData, PCRData, formatNumber, generateStrikePrices } from "@/lib/api"

interface PCRIntradayProps {
  instrument: string
  timeframe: string
  strikeRange?: string
  strikeMode?: string
  expiry?: string
  refreshKey?: number
}

interface ProcessedPCRData {
  time: string
  diff: number
  pcr: number
  optionSignal: string
  spotPrice: number
  changeOIPCR: number
  volumePCR: number
}

export default function PCRIntraday({ instrument, timeframe, strikeRange, strikeMode, expiry, refreshKey }: PCRIntradayProps) {
  const [pcrData, setPcrData] = useState<ProcessedPCRData[]>([])
  const [chartData, setChartData] = useState<ProcessedPCRData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newestFirst, setNewestFirst] = useState(true)
  const [chartRange, setChartRange] = useState([0, 100]) // Start and end percentage of data to show

  // Process trending OI data into display format
  const processTrendingOIData = (rawData: TrendingOIData[]): ProcessedPCRData[] => {
    return rawData.map((item) => {
      // Use diff_in_oi directly from API without calculations
      const diff = item.diff_in_oi

      // Use sentiment from API
      let optionSignal = item.sentiment || "Neutral"

      return {
        time: item.time,
        diff,
        pcr: item.change_in_oi_pcr, // Display COI PCR (change_in_oi_pcr) in PCR column
        optionSignal,
        spotPrice: item.index_close,
        changeOIPCR: item.change_in_oi_pcr,
        volumePCR: item.volume_pcr
      }
    })
  }

  // Process raw PCR data into display format (for charts using oi-pcr-data API)
  const processPCRData = (rawData: any[]): ProcessedPCRData[] => {
    return rawData.map((item, index) => {
      const time = new Date(item.time).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })

      // Use data directly from oi-pcr-data API
      return {
        time,
        diff: item.change_oi_pcr, // Use change_oi_pcr as diff for charts
        pcr: item.pcr, // Use pcr for PCR column in charts
        optionSignal: "Neutral", // Not used in charts
        spotPrice: item.index_close,
        changeOIPCR: item.change_oi_pcr,
        volumePCR: item.volume_pcr
      }
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const symbolForAPI = getSymbolForAPI(instrument)

        console.log('Fetching PCR data with params:', {
          symbol: symbolForAPI,
          strikeRange,
          expiry,
          timeframe
        })

        // Fetch table data (affected by timeframe, strikeRange, and expiry)
        const tableRawData = await fetchTrendingOIData(
          symbolForAPI,
          strikeRange,
          expiry,
          timeframe || '3',
          ''
        )

        console.log('Received table data:', tableRawData.length, 'items')

        if (tableRawData.length > 0) {
          const processedTableData = processTrendingOIData(tableRawData)
          setPcrData(processedTableData)
        } else {
          setPcrData([])
        }

        // Fetch chart data (NOT affected by timeframe or strikeRange - use oi-pcr-data API)
        const chartRawData = await fetchPCRData(symbolForAPI, '')

        console.log('Received chart data:', chartRawData.length, 'items')

        if (chartRawData.length > 0) {
          const processedChartData = processPCRData(chartRawData)
          // Sort chart data chronologically
          const sortedChartData = processedChartData.sort((a, b) => {
            const timeA = new Date(a.time)
            const timeB = new Date(b.time)
            return timeA.getTime() - timeB.getTime()
          })
          console.log('Chart data sample:', sortedChartData.slice(0, 3))
          setChartData(sortedChartData)
        } else {
          setChartData([])
        }

      } catch (err) {
        console.error('Error fetching PCR data:', err)
        setError('Failed to load PCR data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [instrument, timeframe, strikeRange, expiry, refreshKey])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading PCR data...</div>
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

  // Sort data based on newestFirst preference
  const sortedPcrData = [...pcrData].sort((a, b) => {
    const timeA = new Date(`2025-09-16 ${a.time}`)
    const timeB = new Date(`2025-09-16 ${b.time}`)
    return newestFirst ? timeB.getTime() - timeA.getTime() : timeA.getTime() - timeB.getTime()
  })

  // Filter chart data based on selected range (start and end percentages)
  const startIndex = Math.floor(chartData.length * (chartRange[0] / 100))
  const endIndex = Math.ceil(chartData.length * (chartRange[1] / 100))
  const filteredChartData = chartData.slice(startIndex, endIndex)

  const pcrVsSpotData = filteredChartData.map((item) => ({
    time: item.time,
    pcr: item.pcr, // Use PCR from oi-pcr-data API
    spotPrice: item.spotPrice,
    changeOIPCR: item.changeOIPCR,
    volumePCR: item.volumePCR
  }))

  console.log('Rendering PCR Intraday with:', {
    pcrDataLength: pcrData.length,
    chartDataLength: chartData.length,
    newestFirst
  })

  return (
    <div className="space-y-6">
      {/* PCR vs Spot Price Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              PCR vs Spot Price - {instrument}
            </CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Time Range: {chartRange[0]}% - {chartRange[1]}%
                </Label>
                <span className="text-xs text-muted-foreground">
                  {filteredChartData.length} data points
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
              {filteredChartData.length > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  Showing: {filteredChartData[0]?.time} to {filteredChartData[filteredChartData.length - 1]?.time}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pcrVsSpotData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No chart data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pcrVsSpotData}>
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
                      domain={['dataMin - 5', 'dataMax + 5']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={['dataMin - 5', 'dataMax + 5']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "Spot Price" ? formatNumber(value, 2) : formatNumber(value, 4),
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="pcr"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      name="PCR"
                      dot={false}
                      activeDot={{ r: 3, fill: '#ef4444' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="spotPrice"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      name="Spot Price"
                      dot={false}
                      activeDot={{ r: 3, fill: '#22c55e' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change OI PCR vs Spot Price</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Time Range: {chartRange[0]}% - {chartRange[1]}%
                </Label>
                <span className="text-xs text-muted-foreground">
                  {filteredChartData.length} data points
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
              {filteredChartData.length > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  Showing: {filteredChartData[0]?.time} to {filteredChartData[filteredChartData.length - 1]?.time}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pcrVsSpotData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No chart data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pcrVsSpotData}>
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
                      domain={['dataMin - 5', 'dataMax + 5']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={['dataMin - 5', 'dataMax + 5']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        formatNumber(value, 4),
                        name === "Change OI PCR" ? "COI PCR" : name
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="changeOIPCR"
                      stroke="#8884d8"
                      strokeWidth={1.5}
                      name="Change OI PCR"
                      dot={false}
                      activeDot={{ r: 3, fill: '#8884d8' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="spotPrice"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      name="Spot Price"
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
          <div className="flex items-center justify-between">
          <CardTitle>PCR Intraday Data - {timeframe}min Interval</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="newest-first" 
                checked={newestFirst} 
                onCheckedChange={(checked) => setNewestFirst(checked as boolean)}
              />
              <Label htmlFor="newest-first" className="text-sm font-medium">
                Newest first
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Time</TableHead>
                  <TableHead className="text-center">Diff OI</TableHead>
                  <TableHead className="text-center">Change OI PCR</TableHead>
                  <TableHead className="text-center">Sentiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPcrData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-center">{row.time}</TableCell>
                    <TableCell
                      className={`text-center font-medium ${
                        row.diff > 0 ? "text-green-600" : row.diff < 0 ? "text-red-600" : "text-yellow-600"
                      }`}
                    >
                      {row.diff > 0 ? "+" : ""}
                      {formatNumber(row.diff, 0)}
                    </TableCell>
                    <TableCell className="font-medium text-center">{formatNumber(row.pcr, 2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          row.optionSignal === "Bullish"
                            ? "default"
                            : row.optionSignal === "Bearish"
                              ? "destructive"
                              : "secondary"
                        }
                        className={
                          row.optionSignal === "Bullish"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : row.optionSignal === "Bearish"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }
                      >
                        {row.optionSignal}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
