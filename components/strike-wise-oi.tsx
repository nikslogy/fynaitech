"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface StrikeWiseOIProps {
  instrument: string
  expiry: string
}

export default function StrikeWiseOI({ instrument, expiry }: StrikeWiseOIProps) {
  // Mock strike-wise OI data
  const strikeData = [
    {
      strike: 21700,
      callOI: 2850,
      callChgOI: 250,
      callVolume: 1250,
      callLTP: 185.5,
      putLTP: 12.75,
      putVolume: 850,
      putChgOI: 150,
      putOI: 1250,
    },
    {
      strike: 21750,
      callOI: 3200,
      callChgOI: 450,
      callVolume: 1850,
      callLTP: 142.25,
      putLTP: 18.9,
      putVolume: 1250,
      putChgOI: 350,
      putOI: 1850,
    },
    {
      strike: 21800,
      callOI: 4150,
      callChgOI: 650,
      callVolume: 2450,
      callLTP: 105.75,
      putLTP: 28.5,
      putVolume: 1850,
      putChgOI: 450,
      putOI: 2450,
    },
    {
      strike: 21850,
      callOI: 5200,
      callChgOI: 850,
      callVolume: 3250,
      callLTP: 75.25,
      putLTP: 42.8,
      putVolume: 2850,
      putChgOI: 650,
      putOI: 3850,
    },
    {
      strike: 21900,
      callOI: 3850,
      callChgOI: 550,
      callVolume: 2150,
      callLTP: 52.5,
      putLTP: 65.25,
      putVolume: 3250,
      putChgOI: 750,
      putOI: 4200,
    },
    {
      strike: 21950,
      callOI: 2650,
      callChgOI: 350,
      callVolume: 1450,
      callLTP: 35.75,
      putLTP: 95.5,
      putVolume: 2450,
      putChgOI: 550,
      putOI: 3150,
    },
    {
      strike: 22000,
      callOI: 1850,
      callChgOI: 250,
      callVolume: 950,
      callLTP: 24.25,
      putLTP: 135.75,
      putVolume: 1850,
      putChgOI: 450,
      putOI: 2450,
    },
  ]

  const chartData = strikeData.map((item) => ({
    strike: item.strike,
    callOI: item.callOI,
    putOI: item.putOI,
  }))

  const getOIIntensity = (oi: number) => {
    if (oi > 4000) return "bg-red-100 dark:bg-red-950"
    if (oi > 3000) return "bg-yellow-100 dark:bg-yellow-950"
    if (oi > 2000) return "bg-green-100 dark:bg-green-950"
    return ""
  }

  return (
    <div className="space-y-6">
      {/* OI Chart */}
      <Card>
        <CardHeader>
          <CardTitle>OI Distribution by Strike - {instrument}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strike" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="callOI" fill="hsl(var(--chart-1))" name="Call OI" />
                <Bar dataKey="putOI" fill="hsl(var(--chart-2))" name="Put OI" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strike-wise OI Table */}
      <Card>
        <CardHeader>
          <CardTitle>Strike-wise Open Interest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Strike</TableHead>
                  <TableHead>Call OI</TableHead>
                  <TableHead>Call Chg OI</TableHead>
                  <TableHead>Call Volume</TableHead>
                  <TableHead>Call LTP</TableHead>
                  <TableHead>Put LTP</TableHead>
                  <TableHead>Put Volume</TableHead>
                  <TableHead>Put Chg OI</TableHead>
                  <TableHead>Put OI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {strikeData.map((row) => (
                  <TableRow key={row.strike} className={row.strike === 21850 ? "bg-muted/50" : ""}>
                    <TableCell className="font-bold">{row.strike}</TableCell>
                    <TableCell className={`font-medium ${getOIIntensity(row.callOI)}`}>
                      {row.callOI.toLocaleString()}
                    </TableCell>
                    <TableCell className={row.callChgOI > 0 ? "text-bullish" : "text-bearish"}>
                      {row.callChgOI > 0 ? "+" : ""}
                      {row.callChgOI}
                    </TableCell>
                    <TableCell>{row.callVolume.toLocaleString()}</TableCell>
                    <TableCell>₹{row.callLTP}</TableCell>
                    <TableCell>₹{row.putLTP}</TableCell>
                    <TableCell>{row.putVolume.toLocaleString()}</TableCell>
                    <TableCell className={row.putChgOI > 0 ? "text-bullish" : "text-bearish"}>
                      {row.putChgOI > 0 ? "+" : ""}
                      {row.putChgOI}
                    </TableCell>
                    <TableCell className={`font-medium ${getOIIntensity(row.putOI)}`}>
                      {row.putOI.toLocaleString()}
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
