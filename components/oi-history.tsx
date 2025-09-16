"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from "recharts"

interface OIHistoryProps {
  instrument: string
}

export default function OIHistory({ instrument }: OIHistoryProps) {
  // Mock OI history data
  const historyData = [
    { datetime: "2024-01-22 15:30", callOI: 125000, putOI: 98000, netOIDelta: 27000, derivedPCR: 0.78 },
    { datetime: "2024-01-23 15:30", callOI: 132000, putOI: 105000, netOIDelta: 27000, derivedPCR: 0.8 },
    { datetime: "2024-01-24 15:30", callOI: 128000, putOI: 112000, netOIDelta: 16000, derivedPCR: 0.88 },
    { datetime: "2024-01-25 09:15", callOI: 135000, putOI: 118000, netOIDelta: 17000, derivedPCR: 0.87 },
    { datetime: "2024-01-25 10:15", callOI: 138000, putOI: 125000, netOIDelta: 13000, derivedPCR: 0.91 },
    { datetime: "2024-01-25 11:15", callOI: 142000, putOI: 128000, netOIDelta: 14000, derivedPCR: 0.9 },
    { datetime: "2024-01-25 12:15", callOI: 145000, putOI: 132000, netOIDelta: 13000, derivedPCR: 0.91 },
  ]

  const chartData = historyData.map((item) => ({
    time: item.datetime.split(" ")[1] || item.datetime.split(" ")[0].slice(-5),
    callOI: item.callOI / 1000, // Convert to thousands for better chart readability
    putOI: item.putOI / 1000,
    pcr: item.derivedPCR,
  }))

  return (
    <div className="space-y-6">
      {/* OI History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>OI History & PCR Trend - {instrument}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0.7, 1.0]} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="callOI" fill="hsl(var(--chart-1))" name="Call OI (K)" />
                <Bar yAxisId="left" dataKey="putOI" fill="hsl(var(--chart-2))" name="Put OI (K)" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pcr"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="PCR"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* OI History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historical OI Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Call OI</TableHead>
                  <TableHead>Put OI</TableHead>
                  <TableHead>Net OI Delta</TableHead>
                  <TableHead>Derived PCR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.datetime}</TableCell>
                    <TableCell>{row.callOI.toLocaleString()}</TableCell>
                    <TableCell>{row.putOI.toLocaleString()}</TableCell>
                    <TableCell
                      className={
                        row.netOIDelta > 20000
                          ? "text-bullish font-medium"
                          : row.netOIDelta < 15000
                            ? "text-bearish font-medium"
                            : ""
                      }
                    >
                      {row.netOIDelta.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={`font-medium ${row.derivedPCR > 0.85 ? "text-bearish" : row.derivedPCR < 0.8 ? "text-bullish" : ""}`}
                    >
                      {row.derivedPCR}
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
