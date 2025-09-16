"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

// Mock data for demonstration
const niftyData = [
  { time: "09:15", price: 24150, volume: 1200 },
  { time: "09:30", price: 24180, volume: 1450 },
  { time: "09:45", price: 24165, volume: 1320 },
  { time: "10:00", price: 24195, volume: 1680 },
  { time: "10:15", price: 24220, volume: 1890 },
  { time: "10:30", price: 24205, volume: 1750 },
  { time: "10:45", price: 24235, volume: 2100 },
  { time: "11:00", price: 24250, volume: 2350 },
]

const bankNiftyData = [
  { time: "09:15", price: 51200, volume: 800 },
  { time: "09:30", price: 51180, volume: 950 },
  { time: "09:45", price: 51220, volume: 1100 },
  { time: "10:00", price: 51195, volume: 1250 },
  { time: "10:15", price: 51240, volume: 1400 },
  { time: "10:30", price: 51225, volume: 1350 },
  { time: "10:45", price: 51260, volume: 1600 },
  { time: "11:00", price: 51275, volume: 1750 },
]

const IndexCard = ({
  title,
  currentPrice,
  change,
  changePercent,
  trend,
  data,
  strength,
}: {
  title: string
  currentPrice: number
  change: number
  changePercent: number
  trend: "up" | "down" | "neutral"
  data: any[]
  strength: "Bullish" | "Bearish" | "Neutral"
}) => {
  const isPositive = change > 0
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-[family-name:var(--font-space-grotesk)]">{title}</CardTitle>
          <Badge
            variant={strength === "Bullish" ? "default" : strength === "Bearish" ? "destructive" : "secondary"}
            className={strength === "Bullish" ? "bg-accent text-accent-foreground" : ""}
          >
            {strength}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
            {currentPrice.toLocaleString()}
          </span>
          <div className={`flex items-center space-x-1 ${isPositive ? "text-bullish" : "text-bearish"}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="font-medium">
              {isPositive ? "+" : ""}
              {change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#4ade80" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#4ade80" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#4ade80" : "#ef4444"}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [value.toLocaleString(), "Price"]}
                labelFormatter={(label) => `Time: ${label}`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Volume</p>
            <p className="font-medium">{data[data.length - 1]?.volume.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Trend</p>
            <div className="flex items-center space-x-1">
              <TrendIcon className={`w-3 h-3 ${isPositive ? "text-bullish" : "text-bearish"}`} />
              <span className="font-medium capitalize">{trend}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const MarketOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Market Overview</span>
        </CardTitle>
        <CardDescription>Real-time market sentiment and key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Market Sentiment</p>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-bullish rounded-full"></div>
              <span className="font-medium">Bullish</span>
            </div>
            <Progress value={65} className="h-2" />
            <p className="text-xs text-muted-foreground">65% Bullish signals</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Volatility Index</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">18.45</span>
              <Badge variant="secondary">Moderate</Badge>
            </div>
            <Progress value={45} className="h-2" />
            <p className="text-xs text-muted-foreground">Within normal range</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Signals</p>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-bullish">12</span>
              <span className="text-sm text-muted-foreground">Buy</span>
              <span className="text-lg font-bold text-bearish">8</span>
              <span className="text-sm text-muted-foreground">Sell</span>
            </div>
            <p className="text-xs text-muted-foreground">Last updated: 11:00 AM</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <MarketOverview />

      {/* Index Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndexCard
          title="Nifty 50"
          currentPrice={24250}
          change={85.5}
          changePercent={0.35}
          trend="up"
          data={niftyData}
          strength="Bullish"
        />
        <IndexCard
          title="Bank Nifty"
          currentPrice={51275}
          change={125.3}
          changePercent={0.24}
          trend="up"
          data={bankNiftyData}
          strength="Bullish"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Day High</p>
              <p className="text-lg font-bold text-bullish">24,285</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Day Low</p>
              <p className="text-lg font-bold text-bearish">24,120</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">PCR</p>
              <p className="text-lg font-bold">0.85</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">OI Change</p>
              <p className="text-lg font-bold text-bullish">+12.5%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
