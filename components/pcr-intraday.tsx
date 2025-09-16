"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts"

interface PCRIntradayProps {
  instrument: string
  timeframe: string
}

export default function PCRIntraday({ instrument, timeframe }: PCRIntradayProps) {
  const pcrData = [
    { time: "09:15", diff: 2.5, pcr: 0.78, optionSignal: "Bullish", spotPrice: 25100 },
    { time: "09:30", diff: 1.8, pcr: 0.8, optionSignal: "Neutral", spotPrice: 25095 },
    { time: "09:45", diff: -1.2, pcr: 0.82, optionSignal: "Bearish", spotPrice: 25085 },
    { time: "10:00", diff: -2.8, pcr: 0.85, optionSignal: "Bearish", spotPrice: 25075 },
    { time: "10:15", diff: 0.5, pcr: 0.86, optionSignal: "Neutral", spotPrice: 25080 },
    { time: "10:30", diff: 3.2, pcr: 0.83, optionSignal: "Bullish", spotPrice: 25090 },
    { time: "10:45", diff: 1.5, pcr: 0.81, optionSignal: "Neutral", spotPrice: 25095 },
    { time: "11:00", diff: -0.8, pcr: 0.84, optionSignal: "Bearish", spotPrice: 25088 },
    { time: "11:15", diff: 2.1, pcr: 0.79, optionSignal: "Bullish", spotPrice: 25098 },
    { time: "11:30", diff: -1.5, pcr: 0.87, optionSignal: "Bearish", spotPrice: 25082 },
    { time: "11:45", diff: 0.8, pcr: 0.82, optionSignal: "Neutral", spotPrice: 25089 },
    { time: "12:00", diff: 1.9, pcr: 0.8, optionSignal: "Bullish", spotPrice: 25094 },
  ]

  const pcrVsSpotData = pcrData.map((item) => ({
    time: item.time,
    pcr: item.pcr,
    spotPrice: item.spotPrice / 100, // Scale down for better visualization
    changeOIPCR: item.pcr * 1.1 + Math.random() * 0.05 - 0.025, // Mock change OI PCR
  }))

  return (
    <div className="space-y-6">
      {/* PCR vs Spot Price Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              PCR vs Spot Price - {instrument} ({timeframe}min)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={pcrVsSpotData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="pcr" stroke="#ef4444" strokeWidth={2} name="PCR" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="spotPrice"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Spot Price (÷100)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change OI PCR vs Spot Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={pcrVsSpotData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="changeOIPCR"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Change OI PCR"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="spotPrice"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Spot Price (÷100)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PCR Intraday Data - {timeframe}min Timeframe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Time</TableHead>
                  <TableHead className="text-center">Diff</TableHead>
                  <TableHead className="text-center">PCR</TableHead>
                  <TableHead className="text-center">Option Signal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pcrData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-center">{row.time}</TableCell>
                    <TableCell
                      className={`text-center font-medium ${
                        row.diff > 0 ? "text-green-600" : row.diff < 0 ? "text-red-600" : "text-yellow-600"
                      }`}
                    >
                      {row.diff > 0 ? "+" : ""}
                      {row.diff}
                    </TableCell>
                    <TableCell className="font-medium text-center">{row.pcr}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          row.optionSignal === "Bullish"
                            ? "default"
                            : row.optionSignal === "Bearish"
                              ? "destructive"
                              : "secondary"
                        }
                        className={
                          row.optionSignal === "Bullish"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : row.optionSignal === "Bearish"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }
                      >
                        {row.optionSignal}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
