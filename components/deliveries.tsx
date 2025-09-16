"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function Deliveries() {
  // Mock delivery data
  const deliveryData = [
    {
      symbol: "RELIANCE",
      deliveryQty: 2850000,
      deliveryPercent: 68.5,
      priceChange: 1.8,
      rollingTrend: "Increasing",
    },
    {
      symbol: "TCS",
      deliveryQty: 1250000,
      deliveryPercent: 72.3,
      priceChange: 1.2,
      rollingTrend: "Stable",
    },
    {
      symbol: "HDFC BANK",
      deliveryQty: 3200000,
      deliveryPercent: 65.8,
      priceChange: 2.1,
      rollingTrend: "Increasing",
    },
    {
      symbol: "INFOSYS",
      deliveryQty: 1850000,
      deliveryPercent: 69.2,
      priceChange: 0.8,
      rollingTrend: "Decreasing",
    },
    {
      symbol: "ICICI BANK",
      deliveryQty: 2650000,
      deliveryPercent: 71.5,
      priceChange: 1.5,
      rollingTrend: "Stable",
    },
    {
      symbol: "BHARTI AIRTEL",
      deliveryQty: 1950000,
      deliveryPercent: 58.9,
      priceChange: -0.5,
      rollingTrend: "Decreasing",
    },
  ]

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Increasing":
        return "default"
      case "Stable":
        return "secondary"
      case "Decreasing":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getDeliveryIntensity = (percent: number) => {
    if (percent > 70) return "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200"
    if (percent > 60) return "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200"
    return "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Delivery Quantity</TableHead>
                  <TableHead>Delivery %</TableHead>
                  <TableHead>Price Change %</TableHead>
                  <TableHead>Rolling Delivery Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.symbol}</TableCell>
                    <TableCell>{row.deliveryQty.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getDeliveryIntensity(row.deliveryPercent)}`}
                      >
                        {row.deliveryPercent}%
                      </span>
                    </TableCell>
                    <TableCell className={`font-medium ${row.priceChange > 0 ? "text-bullish" : "text-bearish"}`}>
                      {row.priceChange > 0 ? "+" : ""}
                      {row.priceChange}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTrendColor(row.rollingTrend)}>{row.rollingTrend}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">High Delivery Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bullish">4</div>
            <p className="text-sm text-muted-foreground">Above 70% delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Delivery %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67.7%</div>
            <p className="text-sm text-muted-foreground">Across top stocks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Increasing Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bullish">2</div>
            <p className="text-sm text-muted-foreground">Stocks showing growth</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
