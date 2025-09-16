"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface VWAPFuturesProps {
  instrument: string
}

export default function VWAPFutures({ instrument }: VWAPFuturesProps) {
  // Mock VWAP and futures data
  const vwapData = [
    { time: "09:15", futuresPrice: 21845, vwap: 21840, deviation: 5, confluenceFlags: "PCR Bullish" },
    { time: "09:30", futuresPrice: 21850, vwap: 21842, deviation: 8, confluenceFlags: "PCR Neutral" },
    { time: "09:45", futuresPrice: 21848, vwap: 21845, deviation: 3, confluenceFlags: "PCR Bearish" },
    { time: "10:00", futuresPrice: 21852, vwap: 21847, deviation: 5, confluenceFlags: "PCR Bullish" },
    { time: "10:15", futuresPrice: 21855, vwap: 21850, deviation: 5, confluenceFlags: "PCR Neutral" },
    { time: "10:30", futuresPrice: 21851, vwap: 21851, deviation: 0, confluenceFlags: "PCR Alignment" },
    { time: "10:45", futuresPrice: 21849, vwap: 21852, deviation: -3, confluenceFlags: "PCR Bearish" },
  ]

  const chartData = vwapData.map((item) => ({
    time: item.time,
    futuresPrice: item.futuresPrice,
    vwap: item.vwap,
  }))

  const getDeviationColor = (deviation: number) => {
    if (Math.abs(deviation) <= 2) return "text-muted-foreground"
    return deviation > 0 ? "text-bullish" : "text-bearish"
  }

  const getConfluenceColor = (flag: string) => {
    if (flag.includes("Bullish")) return "default"
    if (flag.includes("Bearish")) return "destructive"
    if (flag.includes("Alignment")) return "default"
    return "secondary"
  }

  return (
    <div className="space-y-6">
      {/* VWAP Chart */}
      <Card>
        <CardHeader>
          <CardTitle>VWAP vs Futures Price - {instrument}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="futuresPrice"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Futures Price"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="vwap"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="VWAP"
                  dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* VWAP Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>VWAP & Futures Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Futures Price</TableHead>
                  <TableHead>VWAP</TableHead>
                  <TableHead>Deviation from VWAP</TableHead>
                  <TableHead>Confluence Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vwapData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.time}</TableCell>
                    <TableCell className="font-medium">{row.futuresPrice}</TableCell>
                    <TableCell>{row.vwap}</TableCell>
                    <TableCell className={`font-medium ${getDeviationColor(row.deviation)}`}>
                      {row.deviation > 0 ? "+" : ""}
                      {row.deviation} pts
                    </TableCell>
                    <TableCell>
                      <Badge variant={getConfluenceColor(row.confluenceFlags)}>{row.confluenceFlags}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* VWAP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current VWAP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21,852</div>
            <p className="text-sm text-muted-foreground">Volume weighted average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Deviation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bearish">-3 pts</div>
            <p className="text-sm text-muted-foreground">Below VWAP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">VWAP Bias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bearish">Bearish</div>
            <p className="text-sm text-muted-foreground">Price below VWAP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Signal Confluence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bearish">Bearish</div>
            <p className="text-sm text-muted-foreground">PCR + VWAP alignment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
