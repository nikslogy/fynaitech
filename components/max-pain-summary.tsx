"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from "recharts"
import { Slider } from "@/components/ui/slider"
import {
  fetchMaxPainIntradayChart,
  fetchTodaySpotData,
  processMaxPainData,
  calculateMaxPainInsights,
  formatMaxPainValue,
  type MaxPainIntradayData,
  type TodaySpotData,
  type ProcessedMaxPainData
} from "@/lib/api"

interface MaxPainSummaryProps {
  instrument: string
  expiry: string
  timeframe: string
  refreshKey?: number
}

export default function MaxPainSummary({ instrument, expiry, timeframe, refreshKey }: MaxPainSummaryProps) {
  const [maxPainData, setMaxPainData] = useState<MaxPainIntradayData[]>([])
  const [spotData, setSpotData] = useState<TodaySpotData | null>(null)
  const [processedChartData, setProcessedChartData] = useState<ProcessedMaxPainData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [chartRange, setChartRange] = useState([0, 100]) // Start and end percentage of data to show

  useEffect(() => {
    loadData()
  }, [instrument, refreshKey])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [maxPainResponse, spotResponse] = await Promise.all([
        fetchMaxPainIntradayChart(instrument.toLowerCase(), 'nse'),
        fetchTodaySpotData(instrument.toLowerCase())
      ])

      if (maxPainResponse.length > 0) {
        setMaxPainData(maxPainResponse)
        const processedData = processMaxPainData(maxPainResponse[0])
        setProcessedChartData(processedData)
      }

      if (spotResponse) {
        setSpotData(spotResponse)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  // Get latest max pain data for display - use max_pain value from today-spot-data API
  const getLatestMaxPain = () => {
    // Use the max_pain value directly from the today-spot-data API
    if (!spotData) return null;

    // The max_pain value comes directly from the today-spot-data API
    const currentMaxPain = spotData.max_pain;
    const currentSpotPrice = spotData.last_trade_price;

    return {
      maxPain: currentMaxPain,
      spotPrice: currentSpotPrice,
      time: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      timestamp: spotData.created_at
    };
  };

  const latestMaxPainData = getLatestMaxPain();

  // Filter chart data based on selected range (start and end percentages)
  const startIndex = Math.floor(processedChartData.length * (chartRange[0] / 100))
  const endIndex = Math.ceil(processedChartData.length * (chartRange[1] / 100))
  const filteredChartData = processedChartData.slice(startIndex, endIndex)

  // Calculate insights from the filtered data (based on selected time range)
  const insights = spotData && filteredChartData.length > 0
    ? calculateMaxPainInsights(filteredChartData, spotData.last_trade_price)
    : null

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getValueColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case 'Bullish': return <TrendingUp className="w-4 h-4" />
      case 'Bearish': return <TrendingDown className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
            <div className="h-64 bg-gray-200 rounded"></div>
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
                onClick={handleRefresh}
                variant="outline"
                className="mt-4"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Max Pain Analysis - {instrument}</h2>
          <p className="text-sm text-muted-foreground">Real-time max pain levels and spot price correlation</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Real-time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Max Pain Level vs Spot Price - {instrument}</span>
            <Badge variant="outline">
              {filteredChartData.length} data points
            </Badge>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Time Range: {chartRange[0]}% - {chartRange[1]}%
              </span>
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
          {spotData && (
            <div className="text-sm text-muted-foreground">
              Current Spot: ₹{spotData.last_trade_price.toLocaleString('en-IN')} |
              Change: <span className={getValueColor(spotData.change_value)}>
                {spotData.change_value > 0 ? '+' : ''}{spotData.change_value.toFixed(2)} ({spotData.change_per > 0 ? '+' : ''}{spotData.change_per.toFixed(2)}%)
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 50', 'dataMax + 50']}
                />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `₹${Number(value).toLocaleString('en-IN')}`,
                    name === 'maxPain' ? 'Max Pain Level' : 'Spot Price'
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="maxPain"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="maxPain"
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="spotPrice"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="spotPrice"
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Max Pain Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Current Max Pain
              {insights && getBiasIcon(insights.bias)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMaxPainData ? formatMaxPainValue(latestMaxPainData.maxPain) : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              {insights ? (
                <>
                  {insights.distanceFromSpot > 0 ? '+' : ''}{insights.distanceFromSpot} pts from spot
                </>
              ) : 'Distance from spot'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Market Bias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              insights?.bias === 'Bullish' ? 'text-green-600' :
              insights?.bias === 'Bearish' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {insights ? insights.bias : 'Neutral'}
              {insights && getBiasIcon(insights.bias)}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on max pain vs spot
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Volatility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights ? `${insights.volatility} pts` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Intraday volatility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">OI Concentration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights ? formatMaxPainValue(insights.highestOIStrike) : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">
              Highest concentration strike
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Max Pain Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Max Pain Movements</CardTitle>
          <p className="text-sm text-muted-foreground">
            Intraday max pain level changes and analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Max Pain Level</TableHead>
                  <TableHead>Spot Price</TableHead>
                  <TableHead>Difference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedChartData.slice(-10).reverse().map((row, index) => {
                  const difference = row.spotPrice - row.maxPain;
                  const isAbove = difference > 0;
                  const isBelow = difference < 0;
                  const isAtLevel = Math.abs(difference) < 10;

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {row.time}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatMaxPainValue(row.maxPain)}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{row.spotPrice.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className={`font-medium ${getValueColor(difference)}`}>
                        {difference > 0 ? '+' : ''}{difference.toFixed(1)} pts
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isAbove ? 'default' :
                            isBelow ? 'destructive' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {isAbove ? 'Above MP' : isBelow ? 'Below MP' : 'At MP'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trading Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Option Trading Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Current Market Position</span>
              <Badge
                variant={
                  insights?.bias === 'Bullish' ? 'default' :
                  insights?.bias === 'Bearish' ? 'destructive' :
                  'secondary'
                }
              >
                {insights?.bias || 'Neutral'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Max Pain Distance</span>
              <span className={`font-medium ${insights ? getValueColor(insights.distanceFromSpot) : ''}`}>
                {insights ? `${insights.distanceFromSpot > 0 ? '+' : ''}${insights.distanceFromSpot} pts` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Volatility Level</span>
              <Badge variant="outline">
                {insights && insights.volatility > 100 ? 'High' : insights && insights.volatility > 50 ? 'Moderate' : 'Low'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Expiry Impact</span>
              <Badge variant={Math.abs(insights?.distanceFromSpot || 0) < 50 ? 'default' : 'secondary'}>
                {Math.abs(insights?.distanceFromSpot || 0) < 50 ? 'High' : 'Moderate'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Max Pain Theory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Max Pain Theory:</strong> The strike price where the maximum number of options expire worthless,
                minimizing payouts for option writers (market makers).
              </p>
              <p>
                <strong>Market Maker Strategy:</strong> Market makers hedge their positions to minimize losses.
                Prices often gravitate toward max pain levels as expiry approaches.
              </p>
              <p>
                <strong>Trading Implication:</strong> Options at max pain strikes have higher probability of expiring worthless,
                affecting option pricing and market maker positioning.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
