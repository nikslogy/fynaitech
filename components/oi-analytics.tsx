"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useState } from "react"

interface OIAnalyticsProps {
  instrument: string
  expiry: string
  timeframe: string
  strikeRange: string
}

export default function OIAnalytics({ instrument, expiry, timeframe, strikeRange }: OIAnalyticsProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [timeRangeFilter, setTimeRangeFilter] = useState("full-session")
  const [customStartTime, setCustomStartTime] = useState("09:15")
  const [customEndTime, setCustomEndTime] = useState("15:30")

  const strikeWiseData = [
    { strike: 24800, callOI: 306, putOI: 127, totalOI: 433, maxPain: false },
    { strike: 24850, callOI: 256, putOI: 66, totalOI: 322, maxPain: false },
    { strike: 24900, callOI: 208, putOI: 114, totalOI: 322, maxPain: false },
    { strike: 24950, callOI: 163, putOI: 81, totalOI: 244, maxPain: false },
    { strike: 25000, callOI: 117, putOI: 204, totalOI: 321, maxPain: false },
    { strike: 25050, callOI: 77, putOI: 109, totalOI: 186, maxPain: true },
    { strike: 25100, callOI: 45, putOI: 168, totalOI: 213, maxPain: false },
    { strike: 25150, callOI: 25, putOI: 33, totalOI: 58, maxPain: false },
    { strike: 25200, callOI: 14, putOI: 25, totalOI: 39, maxPain: false },
  ]

  const callsPutsData = [
    { name: "Calls OI", value: strikeWiseData.reduce((sum, item) => sum + item.callOI, 0), fill: "#ef4444" },
    { name: "Puts OI", value: strikeWiseData.reduce((sum, item) => sum + item.putOI, 0), fill: "#22c55e" },
  ]

  const oiBuildUpData = [
    { strike: 24800, type: "Long Build-up", callChg: 15000, putChg: 8000, signal: "Bullish" },
    { strike: 24900, type: "Short Covering", callChg: -12000, putChg: -5000, signal: "Bullish" },
    { strike: 25000, type: "Long Unwinding", callChg: -8000, putChg: 12000, signal: "Bearish" },
    { strike: 25100, type: "Short Build-up", callChg: 18000, putChg: -3000, signal: "Bearish" },
    { strike: 25200, type: "Long Build-up", callChg: 22000, putChg: 15000, signal: "Neutral" },
  ]

  const filteredData =
    selectedFilter === "all"
      ? oiBuildUpData
      : oiBuildUpData.filter((item) => item.signal.toLowerCase() === selectedFilter)

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <CardTitle className="text-base sm:text-lg break-words">
              OI Analytics - {instrument} ({timeframe}min)
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-session">Full Session</SelectItem>
                  <SelectItem value="morning">9:15 - 12:00</SelectItem>
                  <SelectItem value="afternoon">12:00 - 15:30</SelectItem>
                  <SelectItem value="opening">9:15 - 10:00</SelectItem>
                  <SelectItem value="closing">14:30 - 15:30</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Signals</SelectItem>
                  <SelectItem value="bullish">Bullish</SelectItem>
                  <SelectItem value="bearish">Bearish</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {timeRangeFilter === "custom" && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time" className="text-sm font-medium mb-2 block">
                    Start Time:
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="w-full"
                    min="09:15"
                    max="15:30"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-sm font-medium mb-2 block">
                    End Time:
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="w-full"
                    min="09:15"
                    max="15:30"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-2 break-words">
            <div className="mb-1">
              <strong>Time Range:</strong>{" "}
              {timeRangeFilter === "full-session"
                ? "9:15 AM - 3:30 PM"
                : timeRangeFilter === "morning"
                  ? "9:15 AM - 12:00 PM"
                  : timeRangeFilter === "afternoon"
                    ? "12:00 PM - 3:30 PM"
                    : timeRangeFilter === "opening"
                      ? "9:15 AM - 10:00 AM"
                      : timeRangeFilter === "closing"
                        ? "2:30 PM - 3:30 PM"
                        : `${customStartTime} - ${customEndTime}`}
            </div>
            <div>
              <strong>Strike Range:</strong> {strikeRange}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Calls vs Puts OI Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={callsPutsData}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {callsPutsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Strike-wise OI Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strikeWiseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strike" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="callOI" fill="#ef4444" name="Call OI" />
                  <Bar dataKey="putOI" fill="#22c55e" name="Put OI" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">OI Build-up Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center min-w-[80px]">Strike</TableHead>
                    <TableHead className="text-center min-w-[120px]">Type</TableHead>
                    <TableHead className="text-center min-w-[100px]">Call Change</TableHead>
                    <TableHead className="text-center min-w-[100px]">Put Change</TableHead>
                    <TableHead className="text-center min-w-[80px]">Signal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-center">{row.strike}</TableCell>
                      <TableCell className="text-center text-sm">{row.type}</TableCell>
                      <TableCell
                        className={`text-center font-medium text-sm ${row.callChg > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {row.callChg > 0 ? "+" : ""}
                        {row.callChg.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`text-center font-medium text-sm ${row.putChg > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {row.putChg > 0 ? "+" : ""}
                        {row.putChg.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            row.signal === "Bullish"
                              ? "default"
                              : row.signal === "Bearish"
                                ? "destructive"
                                : "secondary"
                          }
                          className={`text-xs ${
                            row.signal === "Bullish"
                              ? "bg-green-100 text-green-800"
                              : row.signal === "Bearish"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {row.signal}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
