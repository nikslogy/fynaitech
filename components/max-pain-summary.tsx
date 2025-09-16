"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from "recharts"

interface MaxPainSummaryProps {
  instrument: string
  expiry: string
  timeframe: string
}

export default function MaxPainSummary({ instrument, expiry, timeframe }: MaxPainSummaryProps) {
  // Mock max pain data
  const maxPainData = [
    {
      expiry: "25 Jan 2024",
      maxPainStrike: 21800,
      distanceFromSpot: -50,
      oiClusters: "21800 (High), 21850 (Medium)",
      changeSincePrior: -25,
    },
    {
      expiry: "01 Feb 2024",
      maxPainStrike: 21900,
      distanceFromSpot: 50,
      oiClusters: "21900 (High), 22000 (Medium)",
      changeSincePrior: 0,
    },
    {
      expiry: "08 Feb 2024",
      maxPainStrike: 22000,
      distanceFromSpot: 150,
      oiClusters: "22000 (High), 21950 (Medium)",
      changeSincePrior: 25,
    },
    {
      expiry: "29 Feb 2024",
      maxPainStrike: 22100,
      distanceFromSpot: 250,
      oiClusters: "22100 (High), 22200 (Low)",
      changeSincePrior: 50,
    },
  ]

  const maxPainVsSpotData = [
    { time: "09:15", maxPain: 25050, spotPrice: 25100 },
    { time: "09:30", maxPain: 25050, spotPrice: 25095 },
    { time: "09:45", maxPain: 25000, spotPrice: 25085 },
    { time: "10:00", maxPain: 25000, spotPrice: 25075 },
    { time: "10:15", maxPain: 25050, spotPrice: 25080 },
    { time: "10:30", maxPain: 25050, spotPrice: 25090 },
    { time: "10:45", maxPain: 25100, spotPrice: 25095 },
    { time: "11:00", maxPain: 25100, spotPrice: 25088 },
    { time: "11:15", maxPain: 25050, spotPrice: 25098 },
    { time: "11:30", maxPain: 25000, spotPrice: 25082 },
    { time: "11:45", maxPain: 25050, spotPrice: 25089 },
    { time: "12:00", maxPain: 25050, spotPrice: 25094 },
  ]

  const currentSpot = instrument === "NIFTY" ? 25100 : 47250

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Max Pain Level vs Spot Price - {instrument} ({timeframe}min)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maxPainVsSpotData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="maxPain"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Max Pain Level"
                  strokeDasharray="5 5"
                />
                <Line type="monotone" dataKey="spotPrice" stroke="#22c55e" strokeWidth={2} name="Spot Price" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Max Pain Analysis - {instrument}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Max Pain Strike</TableHead>
                  <TableHead>Distance from Spot</TableHead>
                  <TableHead>Notable OI Clusters</TableHead>
                  <TableHead>Change Since Prior Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maxPainData.map((row, index) => (
                  <TableRow key={index} className={row.expiry === expiry ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">
                      {row.expiry}
                      {row.expiry === expiry && (
                        <Badge variant="outline" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-lg">{row.maxPainStrike}</TableCell>
                    <TableCell
                      className={`font-medium ${row.distanceFromSpot > 0 ? "text-green-600" : row.distanceFromSpot < 0 ? "text-red-600" : ""}`}
                    >
                      {row.distanceFromSpot > 0 ? "+" : ""}
                      {row.distanceFromSpot} pts
                    </TableCell>
                    <TableCell className="text-sm">{row.oiClusters}</TableCell>
                    <TableCell
                      className={`font-medium ${row.changeSincePrior > 0 ? "text-green-600" : row.changeSincePrior < 0 ? "text-red-600" : ""}`}
                    >
                      {row.changeSincePrior > 0 ? "+" : ""}
                      {row.changeSincePrior} pts
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Max Pain Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Max Pain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25,050</div>
            <p className="text-sm text-muted-foreground">50 points below spot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nearest Expiry Bias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Bearish</div>
            <p className="text-sm text-muted-foreground">Max pain below spot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">OI Concentration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25,050</div>
            <p className="text-sm text-muted-foreground">Highest OI strike</p>
          </CardContent>
        </Card>
      </div>

      {/* Max Pain Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Max Pain Theory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Max Pain is the strike price where the maximum number of options (both calls and puts) expire worthless,
            causing maximum financial loss to option buyers. The theory suggests that stock prices tend to gravitate
            towards the max pain level as expiry approaches, as market makers hedge their positions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
