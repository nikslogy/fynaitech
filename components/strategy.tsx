"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, BarChart3, Zap, Settings, Play, Pause, Info } from "lucide-react"

const strategiesData = [
  {
    id: 1,
    name: "Breakout Master",
    description: "Identifies strong breakout patterns in Nifty and BankNifty with volume confirmation",
    type: "Breakout",
    timeframe: "5-15min",
    successRate: 78,
    avgReturn: 1.2,
    maxDrawdown: 0.8,
    signals: 12,
    isActive: true,
    riskLevel: "Medium",
    indices: ["Nifty 50", "Bank Nifty"],
  },
  {
    id: 2,
    name: "Trend Rider",
    description: "Follows strong intraday trends with momentum indicators and moving averages",
    type: "Trend-following",
    timeframe: "15-30min",
    successRate: 72,
    avgReturn: 1.8,
    maxDrawdown: 1.2,
    signals: 8,
    isActive: false,
    riskLevel: "Low",
    indices: ["Nifty 50", "Bank Nifty"],
  },
  {
    id: 3,
    name: "Scalp Pro",
    description: "Quick scalping strategy for rapid small profits in high-volume periods",
    type: "Scalping",
    timeframe: "1-3min",
    successRate: 65,
    avgReturn: 0.6,
    maxDrawdown: 0.4,
    signals: 25,
    isActive: true,
    riskLevel: "High",
    indices: ["Nifty 50"],
  },
  {
    id: 4,
    name: "Mean Reversion",
    description: "Captures oversold/overbought conditions with RSI and Bollinger Bands",
    type: "Mean Reversion",
    timeframe: "5-15min",
    successRate: 69,
    avgReturn: 1.0,
    maxDrawdown: 0.9,
    signals: 15,
    isActive: false,
    riskLevel: "Medium",
    indices: ["Bank Nifty"],
  },
]

const StrategyCard = ({
  strategy,
  onToggle,
}: {
  strategy: (typeof strategiesData)[0]
  onToggle: (id: number) => void
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "text-red-500 bg-red-50 border-red-200"
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "Low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Breakout":
        return <TrendingUp className="w-4 h-4" />
      case "Trend-following":
        return <BarChart3 className="w-4 h-4" />
      case "Scalping":
        return <Zap className="w-4 h-4" />
      case "Mean Reversion":
        return <Target className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <Card className={`${strategy.isActive ? "ring-2 ring-primary/20 bg-primary/5" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(strategy.type)}
            <CardTitle className="text-lg">{strategy.name}</CardTitle>
            {strategy.isActive && (
              <Badge className="bg-bullish text-white animate-pulse">
                <Play className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
          <Switch checked={strategy.isActive} onCheckedChange={() => onToggle(strategy.id)} />
        </div>
        <CardDescription className="text-sm">{strategy.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <Badge variant="outline" className="mt-1">
              {strategy.type}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Timeframe</p>
            <p className="font-medium mt-1">{strategy.timeframe}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="font-bold text-bullish">{strategy.successRate}%</p>
            <Progress value={strategy.successRate} className="h-1 mt-1" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Return</p>
            <p className="font-bold text-bullish">+{strategy.avgReturn}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Max DD</p>
            <p className="font-bold text-bearish">-{strategy.maxDrawdown}%</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Signals Today</p>
              <p className="font-bold">{strategy.signals}</p>
            </div>
            <Badge className={`text-xs ${getRiskColor(strategy.riskLevel)}`}>{strategy.riskLevel} Risk</Badge>
          </div>

          <div className="flex gap-2">
            {strategy.indices.map((index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {index === "Nifty 50" ? "N50" : "BN"}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Settings className="w-3 h-3 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Info className="w-3 h-3 mr-2" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const PerformanceOverview = () => {
  const activeStrategies = strategiesData.filter((s) => s.isActive)
  const totalSignals = activeStrategies.reduce((sum, s) => sum + s.signals, 0)
  const avgSuccessRate = activeStrategies.reduce((sum, s) => sum + s.successRate, 0) / activeStrategies.length
  const totalReturn = activeStrategies.reduce((sum, s) => sum + s.avgReturn, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Performance Overview
        </CardTitle>
        <CardDescription>Combined performance of all active strategies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Active Strategies</p>
            <p className="text-2xl font-bold text-primary">{activeStrategies.length}</p>
            <p className="text-xs text-muted-foreground mt-1">of {strategiesData.length} total</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Signals</p>
            <p className="text-2xl font-bold text-bullish">{totalSignals}</p>
            <p className="text-xs text-muted-foreground mt-1">today</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">Avg Success Rate</p>
            <p className="text-2xl font-bold text-bullish">{avgSuccessRate.toFixed(0)}%</p>
            <Progress value={avgSuccessRate} className="h-1 mt-2" />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">Combined Return</p>
            <p className="text-2xl font-bold text-bullish">+{totalReturn.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">potential</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Strategy() {
  const [strategies, setStrategies] = useState(strategiesData)

  const handleToggle = (id: number) => {
    setStrategies((prev) =>
      prev.map((strategy) => (strategy.id === id ? { ...strategy, isActive: !strategy.isActive } : strategy)),
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] flex items-center gap-2">
            <Target className="w-6 h-6" />
            Trading Strategies
          </h2>
          <p className="text-muted-foreground">Predefined intraday templates for Nifty & BankNifty</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start All
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <PerformanceOverview />

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} onToggle={handleToggle} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common strategy management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <Play className="w-6 h-6" />
              <span className="font-medium">Start All Strategies</span>
              <span className="text-xs text-muted-foreground">Activate all configured strategies</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <Pause className="w-6 h-6" />
              <span className="font-medium">Pause All</span>
              <span className="text-xs text-muted-foreground">Temporarily stop all strategies</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <Settings className="w-6 h-6" />
              <span className="font-medium">Risk Management</span>
              <span className="text-xs text-muted-foreground">Configure global risk parameters</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
