"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Trophy, Activity } from "lucide-react"

const rankingsData = [
  {
    index: "Nifty 50",
    strengthScore: 78,
    shortTermTrend: "Up",
    change: "+2.3%",
    momentum: "Strong",
    volume: "High",
    volatility: "Low",
    rank: 1,
  },
  {
    index: "Bank Nifty",
    strengthScore: 72,
    shortTermTrend: "Up",
    change: "+1.8%",
    momentum: "Moderate",
    volume: "Medium",
    volatility: "Medium",
    rank: 2,
  },
]

const RankingCard = ({ data }: { data: (typeof rankingsData)[0] }) => {
  const isUp = data.shortTermTrend === "Up"
  const TrendIcon = isUp ? TrendingUp : TrendingDown

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-bullish"
    if (score >= 50) return "text-yellow-500"
    return "text-bearish"
  }

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case "Strong":
        return "bg-bullish text-white"
      case "Moderate":
        return "bg-yellow-500 text-white"
      case "Weak":
        return "bg-bearish text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="relative">
      <div className="absolute top-4 right-4">
        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
          {data.rank}
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {data.index}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span
            className={`text-2xl font-bold font-[family-name:var(--font-space-grotesk)] ${getScoreColor(data.strengthScore)}`}
          >
            {data.strengthScore}
          </span>
          <span className="text-sm text-muted-foreground">Strength Score</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Overall Strength</span>
            <span className="text-sm font-medium">{data.strengthScore}%</span>
          </div>
          <Progress value={data.strengthScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Short-term Trend</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendIcon className={`w-4 h-4 ${isUp ? "text-bullish" : "text-bearish"}`} />
              <span className={`font-medium ${isUp ? "text-bullish" : "text-bearish"}`}>{data.shortTermTrend}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Change</p>
            <p className={`font-medium mt-1 ${data.change.startsWith("+") ? "text-bullish" : "text-bearish"}`}>
              {data.change}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Momentum</p>
            <Badge className={`mt-1 text-xs ${getMomentumColor(data.momentum)}`}>{data.momentum}</Badge>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">Volume</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {data.volume}
            </Badge>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">Volatility</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {data.volatility}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ComparisonChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Comparison
        </CardTitle>
        <CardDescription>Head-to-head comparison of Nifty vs Bank Nifty</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Strength Comparison */}
          <div>
            <h4 className="font-medium mb-3">Strength Score Comparison</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Nifty 50</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Bank Nifty</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h4 className="font-medium mb-3">Key Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Intraday High</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">24,285</div>
                    <div className="text-sm font-medium">51,320</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Intraday Low</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">24,120</div>
                    <div className="text-sm font-medium">51,080</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Range</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">165 pts</div>
                    <div className="text-sm font-medium">240 pts</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume Ratio</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-bullish">1.2x</div>
                    <div className="text-sm font-medium">0.8x</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volatility</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">0.68%</div>
                    <div className="text-sm font-medium">0.47%</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Momentum</span>
                  <div className="text-right">
                    <Badge className="bg-bullish text-white text-xs">Strong</Badge>
                    <Badge className="bg-yellow-500 text-white text-xs mt-1">Moderate</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Rankings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">Index Rankings</h2>
          <p className="text-muted-foreground">Comparative analysis of Nifty 50 vs Bank Nifty strength</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Live Updates
        </Badge>
      </div>

      {/* Rankings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rankingsData.map((data, index) => (
          <RankingCard key={index} data={data} />
        ))}
      </div>

      {/* Comparison Chart */}
      <ComparisonChart />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Leader</p>
              <p className="text-lg font-bold text-bullish">Nifty 50</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Strength</p>
              <p className="text-lg font-bold">75</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Trend Alignment</p>
              <p className="text-lg font-bold text-bullish">100%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Last Update</p>
              <p className="text-lg font-bold">11:00 AM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
