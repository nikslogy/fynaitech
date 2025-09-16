"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Clock, TrendingUp, TrendingDown, X, Settings, Filter } from "lucide-react"

const alertsData = [
  {
    id: 1,
    index: "Nifty 50",
    timeframe: "5min",
    signal: "BUY",
    entry: 24235,
    target: 24285,
    stopLoss: 24195,
    timestamp: "11:00 AM",
    priority: "High",
    status: "New",
  },
  {
    id: 2,
    index: "Bank Nifty",
    timeframe: "15min",
    signal: "SELL",
    entry: 51280,
    target: 51220,
    stopLoss: 51320,
    timestamp: "10:55 AM",
    priority: "Medium",
    status: "New",
  },
  {
    id: 3,
    index: "Nifty 50",
    timeframe: "3min",
    signal: "BUY",
    entry: 24220,
    target: 24260,
    stopLoss: 24190,
    timestamp: "10:45 AM",
    priority: "High",
    status: "Acknowledged",
  },
  {
    id: 4,
    index: "Bank Nifty",
    timeframe: "5min",
    signal: "BUY",
    entry: 51240,
    target: 51300,
    stopLoss: 51200,
    timestamp: "10:30 AM",
    priority: "Low",
    status: "Acknowledged",
  },
  {
    id: 5,
    index: "Nifty 50",
    timeframe: "15min",
    signal: "SELL",
    entry: 24200,
    target: 24150,
    stopLoss: 24230,
    timestamp: "10:15 AM",
    priority: "Medium",
    status: "Dismissed",
  },
]

const AlertCard = ({
  alert,
  onDismiss,
  onAcknowledge,
}: {
  alert: (typeof alertsData)[0]
  onDismiss: (id: number) => void
  onAcknowledge: (id: number) => void
}) => {
  const isBuy = alert.signal === "BUY"
  const isNew = alert.status === "New"
  const SignalIcon = isBuy ? TrendingUp : TrendingDown

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card
      className={`${isNew ? "ring-2 ring-primary/20 bg-primary/5" : ""} ${alert.status === "Dismissed" ? "opacity-60" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={isBuy ? "default" : "destructive"}
              className={isBuy ? "bg-bullish text-white" : "bg-bearish text-white"}
            >
              <SignalIcon className="w-3 h-3 mr-1" />
              {alert.signal}
            </Badge>
            <span className="font-medium">{alert.index}</span>
            <Badge variant="outline" className="text-xs">
              {alert.timeframe}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>{alert.priority}</Badge>
            {alert.status !== "Dismissed" && (
              <Button variant="ghost" size="sm" onClick={() => onDismiss(alert.id)} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Entry</p>
            <p className="font-bold">{alert.entry.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-bold text-bullish">{alert.target.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stop Loss</p>
            <p className="font-bold text-bearish">{alert.stopLoss.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{alert.timestamp}</span>
          </div>

          {isNew && (
            <Button variant="outline" size="sm" onClick={() => onAcknowledge(alert.id)} className="text-xs">
              Acknowledge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(alertsData)
  const [filter, setFilter] = useState("all")

  const handleDismiss = (id: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, status: "Dismissed" } : alert)))
  }

  const handleAcknowledge = (id: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, status: "Acknowledged" } : alert)))
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "new") return alert.status === "New"
    if (filter === "acknowledged") return alert.status === "Acknowledged"
    if (filter === "dismissed") return alert.status === "Dismissed"
    return true
  })

  const newAlertsCount = alerts.filter((a) => a.status === "New").length
  const acknowledgedCount = alerts.filter((a) => a.status === "Acknowledged").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Trading Alerts
          </h2>
          <p className="text-muted-foreground">Real-time signal notifications and alerts queue</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">New Alerts</p>
              <p className="text-2xl font-bold text-primary">{newAlertsCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Acknowledged</p>
              <p className="text-2xl font-bold text-muted-foreground">{acknowledgedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold text-red-500">
                {alerts.filter((a) => a.priority === "High" && a.status !== "Dismissed").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-bullish">82%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All Alerts", count: alerts.length },
          { key: "new", label: "New", count: newAlertsCount },
          { key: "acknowledged", label: "Acknowledged", count: acknowledgedCount },
          { key: "dismissed", label: "Dismissed", count: alerts.filter((a) => a.status === "Dismissed").length },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab.key)}
            className="flex items-center gap-2"
          >
            {tab.label}
            <Badge variant="secondary" className="text-xs">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Queue</CardTitle>
          <CardDescription>
            {filteredAlerts.length} alerts {filter !== "all" && `(${filter})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} onAcknowledge={handleAcknowledge} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts found for the selected filter.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
