"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"
import {
  fetchFIIDIIData,
  fetchFIIDIIDatesData,
  calculateRollingAverage,
  calculateCumulativeTotals,
  getTodayData,
  formatFIIDIValue,
  getActivitySentiment,
  type FIIDIIDailyData,
  type FIIDIIMonthlyData
} from "@/lib/api"

export default function FIIDIIFlows({ refreshKey }: { refreshKey?: number } = {}) {
  const [dailyData, setDailyData] = useState<FIIDIIDailyData[]>([])
  const [monthlyData, setMonthlyData] = useState<FIIDIIMonthlyData[]>([])
  const [allMonthlyData, setAllMonthlyData] = useState<FIIDIIMonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('daily')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (availableMonths.length === 0) {
      loadAvailableMonths()
    } else if (selectedMonth) {
      loadData()
    }
  }, [selectedPeriod, selectedMonth, refreshKey, availableMonths])

  const loadAvailableMonths = async () => {
    try {
      const { months } = await fetchFIIDIIDatesData()
      setAvailableMonths(months)
      // Set default to the most recent month with data
      if (months.length > 0 && !selectedMonth) {
        setSelectedMonth(months[0])
      }
    } catch (err) {
      console.error('Failed to load available months:', err)
      // Fallback to current month if API fails
      const now = new Date()
      setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    }
  }

  const loadData = async () => {
    if (!selectedMonth) return

    setLoading(true)
    setError(null)

    try {
      const year = selectedMonth.split('-')[0]
      const month = selectedMonth.split('-')[1]

      if (selectedPeriod === 'daily') {
        // Fetch yearly data and filter by selected month client-side
        const { dailyData: yearlyData, monthlyData: yearlyMonthly } = await fetchFIIDIIData('yearly', year)

        // Filter daily data by selected month
        const filteredDailyData = yearlyData.filter(item => {
          const itemMonth = new Date(item.created_at).toISOString().slice(5, 7) // Extract MM from YYYY-MM-DD
          return itemMonth === month
        })

        setDailyData(filteredDailyData)
        setMonthlyData(yearlyMonthly.filter(m => m.month === selectedMonth)) // Filter monthly data too

        // Store all monthly data for the monthly summary tab
        setAllMonthlyData(yearlyMonthly)
      } else {
        const { dailyData: data, monthlyData: monthly } = await fetchFIIDIIData('yearly', year)
        setDailyData(data)
        setAllMonthlyData(monthly) // Store all monthly data
        setMonthlyData(monthly)
      }
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // This function is now handled in loadData
  const loadAllMonthlyData = async () => {
    // No longer needed as monthly data is loaded in loadData
  }

  const todayData = getTodayData(dailyData)
  const rollingAvg = calculateRollingAverage(dailyData, 5)
  const cumulative = calculateCumulativeTotals(dailyData)
  const sentiment = todayData ? getActivitySentiment(todayData.fii_net_value, todayData.dii_net_value) : { sentiment: 'Neutral', color: 'neutral' as const }

  const isTodayDataAvailable = todayData && (() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayString = today.toISOString().split('T')[0];
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const dataDate = new Date(todayData.created_at).toISOString().split('T')[0];

    // Consider data available if it's from today or yesterday (recent data)
    return dataDate === todayString || dataDate === yesterdayString;
  })()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getValueColor = (value: number) => {
    if (value > 0) return 'text-bullish'
    if (value < 0) return 'text-bearish'
    return 'text-muted-foreground'
  }

  const getValueIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4" />
    if (value < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">Error loading data</p>
              <p className="text-sm mt-2">{error}</p>
              <Button
                onClick={loadData}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">FII/DII Activity Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time institutional flow analysis for option traders
            {lastUpdate && (
              <span className="block text-xs mt-1">
                Last updated: {lastUpdate.toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {selectedPeriod === 'daily' && (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((yearMonth) => {
                  const [year, month] = yearMonth.split('-')
                  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
                  const label = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                  return (
                    <SelectItem key={yearMonth} value={yearMonth}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )}
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Market Sentiment Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Market Sentiment
            <Badge
              variant={sentiment.color === 'bullish' ? 'default' : sentiment.color === 'bearish' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {sentiment.sentiment}
            </Badge>
            {!isTodayDataAvailable && selectedPeriod === 'daily' && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                Using latest available data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">FII Activity</p>
              <p className={`text-lg font-semibold ${todayData?.fii_net_value ? getValueColor(todayData.fii_net_value) : ''}`}>
                {todayData ? formatFIIDIValue(todayData.fii_net_value) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">DII Activity</p>
              <p className={`text-lg font-semibold ${todayData?.dii_net_value ? getValueColor(todayData.dii_net_value) : ''}`}>
                {todayData ? formatFIIDIValue(todayData.dii_net_value) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nifty Change</p>
              <p className={`text-lg font-semibold ${todayData?.change_value ? getValueColor(todayData.change_value) : ''}`}>
                {todayData ? `${todayData.change_value > 0 ? '+' : ''}${todayData.change_value.toFixed(2)} (${todayData.change_per > 0 ? '+' : ''}${todayData.change_per.toFixed(2)}%)` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Combined Flow</p>
              <p className={`text-lg font-semibold ${todayData ? getValueColor(todayData.fii_net_value + todayData.dii_net_value) : ''}`}>
                {todayData ? formatFIIDIValue(todayData.fii_net_value + todayData.dii_net_value) : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Today's FII Net
              {todayData && getValueIcon(todayData.fii_net_value)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayData?.fii_net_value ? getValueColor(todayData.fii_net_value) : ''}`}>
              {todayData ? formatFIIDIValue(todayData.fii_net_value) : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Latest trading session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Today's DII Net
              {todayData && getValueIcon(todayData.dii_net_value)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayData?.dii_net_value ? getValueColor(todayData.dii_net_value) : ''}`}>
              {todayData ? formatFIIDIValue(todayData.dii_net_value) : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Domestic institutional</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              5-Day Rolling Avg
              {getValueIcon(rollingAvg.combinedRollingAvg)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getValueColor(rollingAvg.combinedRollingAvg)}`}>
              {formatFIIDIValue(rollingAvg.combinedRollingAvg)}
            </div>
            <p className="text-sm text-muted-foreground">Combined FII+DII</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Monthly Cumulative
              {getValueIcon(cumulative.combinedCumulative)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getValueColor(cumulative.combinedCumulative)}`}>
              {formatFIIDIValue(cumulative.combinedCumulative)}
            </div>
            <p className="text-sm text-muted-foreground">Total inflows</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Activity</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily FII/DII Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time institutional flows and market impact analysis
                {!isTodayDataAvailable && (
                  <span className="block text-orange-600 mt-1 text-xs">
                    ⚠️ Today's data not yet available. Showing latest available data.
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>FII Net</TableHead>
                      <TableHead>DII Net</TableHead>
                      <TableHead>Combined</TableHead>
                      <TableHead>Nifty Price</TableHead>
                      <TableHead>Nifty Change</TableHead>
                      <TableHead>Activity Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyData.map((row, index) => {
                      const combined = row.fii_net_value + row.dii_net_value
                      const activityType = getActivitySentiment(row.fii_net_value, row.dii_net_value)

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {formatDate(row.created_at)}
                          </TableCell>
                          <TableCell className={`font-medium ${getValueColor(row.fii_net_value)}`}>
                            {formatFIIDIValue(row.fii_net_value)}
                          </TableCell>
                          <TableCell className={`font-medium ${getValueColor(row.dii_net_value)}`}>
                            {formatFIIDIValue(row.dii_net_value)}
                          </TableCell>
                          <TableCell className={`font-bold ${getValueColor(combined)}`}>
                            {formatFIIDIValue(combined)}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{row.last_trade_price.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className={`font-medium ${getValueColor(row.change_value)}`}>
                            {row.change_value > 0 ? '+' : ''}{row.change_value.toFixed(2)}
                            <span className="text-xs ml-1">
                              ({row.change_per > 0 ? '+' : ''}{row.change_per.toFixed(2)}%)
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={activityType.color === 'bullish' ? 'default' : activityType.color === 'bearish' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {activityType.sentiment}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Aggregated institutional activity by month
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>FII Net</TableHead>
                      <TableHead>DII Net</TableHead>
                      <TableHead>Combined</TableHead>
                      <TableHead>Avg Nifty</TableHead>
                      <TableHead>Total Volume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(allMonthlyData.length > 0 ? allMonthlyData : monthlyData).map((row, index) => {
                      const combined = row.fii_net_value + row.dii_net_value
                      const totalVolume = (row.fii_buy_value || 0) + (row.fii_sell_value || 0) + (row.dii_buy_value || 0) + (row.dii_sell_value || 0)

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {new Date(row.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className={`font-medium ${getValueColor(row.fii_net_value)}`}>
                            {formatFIIDIValue(row.fii_net_value)}
                          </TableCell>
                          <TableCell className={`font-medium ${getValueColor(row.dii_net_value)}`}>
                            {formatFIIDIValue(row.dii_net_value)}
                          </TableCell>
                          <TableCell className={`font-bold ${getValueColor(combined)}`}>
                            {formatFIIDIValue(combined)}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{row.last_trade_price.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatFIIDIValue(totalVolume)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trading Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Option Trading Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">FII Buying Pressure</span>
              <Badge variant={todayData?.fii_net_value ? (todayData.fii_net_value > 1000 ? 'default' : 'secondary') : 'secondary'}>
                {todayData?.fii_net_value ? (todayData.fii_net_value > 1000 ? 'High' : 'Low') : 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">DII Support Level</span>
              <Badge variant={todayData?.dii_net_value ? (todayData.dii_net_value > 2000 ? 'default' : 'secondary') : 'secondary'}>
                {todayData?.dii_net_value ? (todayData.dii_net_value > 2000 ? 'Strong' : 'Weak') : 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Market Direction Bias</span>
              <Badge variant={sentiment.color === 'bullish' ? 'default' : sentiment.color === 'bearish' ? 'destructive' : 'secondary'}>
                {sentiment.sentiment}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Volatility Expectation</span>
              <Badge variant="outline">
                {Math.abs(todayData?.change_per || 0) > 1 ? 'High' : 'Moderate'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Flow Consistency</span>
              <Badge variant="outline">
                {rollingAvg.combinedRollingAvg > 1000 ? 'Stable' : 'Variable'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Position Sizing</span>
              <Badge variant="outline">
                {Math.abs(cumulative.combinedCumulative) > 10000 ? 'Large' : 'Moderate'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
