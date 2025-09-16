"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface OIBuildUpProps {
  instrument: string
}

export default function OIBuildUp({ instrument }: OIBuildUpProps) {
  // Mock OI build-up data
  const buildUpData = [
    { symbol: "NIFTY 21850 CE", direction: "Long Build-up", priceChange: 2.5, netOIChange: 1250, volume: 25000 },
    { symbol: "NIFTY 21900 PE", direction: "Short Covering", priceChange: -1.8, netOIChange: -850, volume: 18000 },
    { symbol: "NIFTY 21800 CE", direction: "Short Build-up", priceChange: -3.2, netOIChange: 950, volume: 22000 },
    { symbol: "NIFTY 21950 PE", direction: "Long Unwinding", priceChange: 1.5, netOIChange: -650, volume: 15000 },
    { symbol: "NIFTY 21750 CE", direction: "Long Build-up", priceChange: 4.1, netOIChange: 1450, volume: 28000 },
    { symbol: "NIFTY 22000 PE", direction: "Short Build-up", priceChange: -2.8, netOIChange: 750, volume: 12000 },
  ]

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "Long Build-up":
        return "default"
      case "Short Covering":
        return "default"
      case "Short Build-up":
        return "destructive"
      case "Long Unwinding":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getDirectionBg = (direction: string) => {
    switch (direction) {
      case "Long Build-up":
        return "bg-green-50 dark:bg-green-950"
      case "Short Covering":
        return "bg-blue-50 dark:bg-blue-950"
      case "Short Build-up":
        return "bg-red-50 dark:bg-red-950"
      case "Long Unwinding":
        return "bg-orange-50 dark:bg-orange-950"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OI Build-up Analysis - {instrument}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol/Strike</TableHead>
                  <TableHead>OI Change Direction</TableHead>
                  <TableHead>Price Change %</TableHead>
                  <TableHead>Net OI Change</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildUpData.map((row, index) => (
                  <TableRow key={index} className={getDirectionBg(row.direction)}>
                    <TableCell className="font-medium">{row.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={getDirectionColor(row.direction)}>{row.direction}</Badge>
                    </TableCell>
                    <TableCell
                      className={row.priceChange > 0 ? "text-bullish font-medium" : "text-bearish font-medium"}
                    >
                      {row.priceChange > 0 ? "+" : ""}
                      {row.priceChange}%
                    </TableCell>
                    <TableCell
                      className={row.netOIChange > 0 ? "text-bullish font-medium" : "text-bearish font-medium"}
                    >
                      {row.netOIChange > 0 ? "+" : ""}
                      {row.netOIChange.toLocaleString()}
                    </TableCell>
                    <TableCell>{row.volume.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">OI Build-up Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 dark:bg-green-800 rounded"></div>
              <span>
                <strong>Long Build-up:</strong> Price ↑, OI ↑
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
              <span>
                <strong>Short Covering:</strong> Price ↑, OI ↓
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-200 dark:bg-red-800 rounded"></div>
              <span>
                <strong>Short Build-up:</strong> Price ↓, OI ↑
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-200 dark:bg-orange-800 rounded"></div>
              <span>
                <strong>Long Unwinding:</strong> Price ↓, OI ↓
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
