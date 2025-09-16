"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Target, Shield, RefreshCw } from "lucide-react"

// Mock signals data
const mockSignals = [
  {
    id: 1,
    index: "Nifty 50",
    timeframe: "5min",
    signal: "BUY",
    entryPrice: 24235,
    targetPrice: 24285,
    stopLoss: 24195,
    timestamp: "10:45 AM",
    status: "Active",
    strength: 85,
  },
  {
    id: 2,
    index: "Bank Nifty",
    timeframe: "15min",
    signal: "BUY",
    entryPrice: 51260,
    targetPrice: 51350,
    stopLoss: 51180,
    timestamp: "10:30 AM",
    status: "Active",
    strength: 78,
  },
  {
    id: 3,
    index: "Nifty 50",
    timeframe: "3min",
    signal: "SELL",
    entryPrice: 24220,
    targetPrice: 24180,
    stopLoss: 24250,
    timestamp: "10:15 AM",
    status: "Hit",
    strength: 72,
  },
  {
    id: 4,
    index: "Bank Nifty",
    timeframe: "5min",
    signal: "BUY",
    entryPrice: 51200,
    targetPrice: 51280,
    stopLoss: 51150,
    timestamp: "09:45 AM",
    status: "Hit",
    strength: 88,
  },
  {
    id: 5,
    index: "Nifty 50",
    timeframe: "15min",
    signal: "SELL",
    entryPrice: 24180,
    targetPrice: 24130,
    stopLoss: 24210,
    timestamp: "09:30 AM",
    status: "Invalidated",
    strength: 65,
  },
]

const SignalCard = ({ signal }: { signal: (typeof mockSignals)[0] }) => {
  const isBuy = signal.signal === "BUY"
  const isActive = signal.status === "Active"
  const isHit = signal.status === "Hit"

  return (
    <Card className={`${isActive ? "ring-2 ring-primary/20" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              variant={isBuy ? "default" : "destructive"}
              className={isBuy ? "bg-bullish text-white" : "bg-bearish text-white"}
            >
              {signal.signal}
            </Badge>
            <span className="font-medium">{signal.index}</span>
            <Badge variant="outline" className="text-xs">
              {signal.timeframe}
            </Badge>
          </div>
          <Badge
            variant={isActive ? "default" : isHit ? "secondary" : "outline"}
            className={isActive ? "bg-primary text-primary-foreground animate-pulse" : ""}
          >
            {signal.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              Entry
            </p>
            <p className="font-bold">{signal.entryPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Target
            </p>
            <p className="font-bold text-bullish">{signal.targetPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Stop Loss
            </p>
            <p className="font-bold text-bearish">{signal.stopLoss.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{signal.timestamp}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Strength:</span>
            <Badge variant="outline" className="text-xs">
              {signal.strength}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SignalsTable = ({ signals }: { signals: typeof mockSignals }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Signals</CardTitle>
            <CardDescription>Complete list of trading signals with real-time updates</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Index</TableHead>
              <TableHead>Timeframe</TableHead>
              <TableHead>Signal</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Stop Loss</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Strength</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((signal) => (
              <TableRow key={signal.id} className={signal.status === "Active" ? "bg-muted/30" : ""}>
                <TableCell className="font-medium">{signal.index}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {signal.timeframe}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={signal.signal === "BUY" ? "default" : "destructive"}
                    className={signal.signal === "BUY" ? "bg-bullish text-white" : "bg-bearish text-white"}
                  >
                    {signal.signal}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">{signal.entryPrice.toLocaleString()}</TableCell>
                <TableCell className="font-mono text-bullish">{signal.targetPrice.toLocaleString()}</TableCell>
                <TableCell className="font-mono text-bearish">{signal.stopLoss.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{signal.timestamp}</TableCell>
                <TableCell>
                  <Badge
                    variant={signal.status === "Active" ? "default" : signal.status === "Hit" ? "secondary" : "outline"}
                    className={signal.status === "Active" ? "bg-primary text-primary-foreground" : ""}
                  >
                    {signal.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {signal.strength}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function Signals() {
  const [view, setView] = useState("cards")
  const activeSignals = mockSignals.filter((s) => s.status === "Active")
  const recentSignals = mockSignals.slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Signals</p>
              <p className="text-2xl font-bold text-primary">{activeSignals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Buy Signals</p>
              <p className="text-2xl font-bold text-bullish">
                {mockSignals.filter((s) => s.signal === "BUY" && s.status === "Active").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Sell Signals</p>
              <p className="text-2xl font-bold text-bearish">
                {mockSignals.filter((s) => s.signal === "SELL" && s.status === "Active").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-bullish">78%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-6">
          {/* Active Signals */}
          {activeSignals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Active Signals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSignals.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Signals */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Signals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="table">
          <SignalsTable signals={mockSignals} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
