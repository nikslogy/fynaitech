"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Activity, RefreshCw, Eye } from "lucide-react"

// Mock OI data
const oiData = [
  { strike: 24000, callOI: 45000, putOI: 32000, callChange: 12.5, putChange: -8.2, type: "OTM" },
  { strike: 24050, callOI: 52000, putOI: 38000, callChange: 15.3, putChange: -5.1, type: "OTM" },
  { strike: 24100, callOI: 68000, putOI: 45000, callChange: 18.7, putChange: -2.3, type: "OTM" },
  { strike: 24150, callOI: 85000, putOI: 62000, callChange: 22.1, putChange: 3.4, type: "OTM" },
  { strike: 24200, callOI: 125000, putOI: 89000, callChange: 28.5, putChange: 8.7, type: "ITM" },
  { strike: 24250, callOI: 180000, putOI: 145000, callChange: 35.2, putChange: 15.6, type: "ATM" },
  { strike: 24300, callOI: 165000, putOI: 125000, callChange: 25.8, putChange: 12.3, type: "ITM" },
  { strike: 24350, callOI: 95000, putOI: 78000, callChange: 18.4, putChange: 9.1, type: "ITM" },
  { strike: 24400, callOI: 72000, putOI: 55000, callChange: 12.7, putChange: 6.8, type: "ITM" },
  { strike: 24450, callOI: 48000, putOI: 35000, callChange: 8.9, putChange: 4.2, type: "ITM" },
]

const bankNiftyOIData = [
  { strike: 51000, callOI: 25000, putOI: 18000, callChange: 10.2, putChange: -6.5, type: "OTM" },
  { strike: 51100, callOI: 35000, putOI: 28000, callChange: 14.8, putChange: -3.2, type: "OTM" },
  { strike: 51200, callOI: 48000, putOI: 42000, callChange: 19.5, putChange: 2.1, type: "OTM" },
  { strike: 51300, callOI: 95000, putOI: 85000, callChange: 32.7, putChange: 18.9, type: "ATM" },
  { strike: 51400, callOI: 78000, putOI: 65000, callChange: 22.3, putChange: 12.4, type: "ITM" },
  { strike: 51500, callOI: 52000, putOI: 38000, callChange: 15.6, putChange: 8.7, type: "ITM" },
]

const pcrData = [
  { time: "09:15", pcr: 0.82, sentiment: "Bullish" },
  { time: "09:30", pcr: 0.85, sentiment: "Bullish" },
  { time: "09:45", pcr: 0.88, sentiment: "Neutral" },
  { time: "10:00", pcr: 0.92, sentiment: "Neutral" },
  { time: "10:15", pcr: 0.89, sentiment: "Neutral" },
  { time: "10:30", pcr: 0.85, sentiment: "Bullish" },
  { time: "10:45", pcr: 0.83, sentiment: "Bullish" },
  { time: "11:00", pcr: 0.81, sentiment: "Bullish" },
]

const OIFlowTable = ({ data, title }: { data: typeof oiData; title: string }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {title} - OI Flow
            </CardTitle>
            <CardDescription>Open Interest analysis with strike-wise breakdown</CardDescription>
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
              <TableHead>Strike</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Call OI</TableHead>
              <TableHead>Put OI</TableHead>
              <TableHead>Call Change</TableHead>
              <TableHead>Put Change</TableHead>
              <TableHead>Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const ratio = (row.putOI / row.callOI).toFixed(2)
              const isATM = row.type === "ATM"

              return (
                <TableRow key={row.strike} className={isATM ? "bg-muted/50 font-medium" : ""}>
                  <TableCell className="font-mono">
                    {row.strike.toLocaleString()}
                    {isATM && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        ATM
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.type === "ITM" ? "default" : row.type === "ATM" ? "secondary" : "outline"}>
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{row.callOI.toLocaleString()}</TableCell>
                  <TableCell className="font-mono">{row.putOI.toLocaleString()}</TableCell>
                  <TableCell className={`font-mono ${row.callChange > 0 ? "text-bullish" : "text-bearish"}`}>
                    {row.callChange > 0 ? "+" : ""}
                    {row.callChange}%
                  </TableCell>
                  <TableCell className={`font-mono ${row.putChange > 0 ? "text-bullish" : "text-bearish"}`}>
                    {row.putChange > 0 ? "+" : ""}
                    {row.putChange}%
                  </TableCell>
                  <TableCell className="font-mono">{ratio}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const OIChart = ({ data, title }: { data: typeof oiData; title: string }) => {
  const chartData = data.map((item) => ({
    strike: item.strike,
    callOI: item.callOI / 1000, // Convert to thousands
    putOI: item.putOI / 1000,
    type: item.type,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} - OI Distribution</CardTitle>
        <CardDescription>Visual representation of Call vs Put Open Interest</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="strike" tick={{ fontSize: 12 }} tickFormatter={(value) => value.toString()} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any, name: string) => [
                  `${(value * 1000).toLocaleString()}`,
                  name === "callOI" ? "Call OI" : "Put OI",
                ]}
                labelFormatter={(label) => `Strike: ${label}`}
              />
              <Bar dataKey="callOI" fill="#4ade80" name="callOI" />
              <Bar dataKey="putOI" fill="#ef4444" name="putOI" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

const PCRAnalysis = () => {
  const currentPCR = pcrData[pcrData.length - 1]
  const pcrTrend = currentPCR.pcr > pcrData[pcrData.length - 2].pcr ? "up" : "down"

  const sentimentData = [
    { name: "Bullish", value: 65, color: "#4ade80" },
    { name: "Neutral", value: 25, color: "#6b7280" },
    { name: "Bearish", value: 10, color: "#ef4444" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            PCR Analysis
          </CardTitle>
          <CardDescription>Put-Call Ratio and market sentiment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)]">{currentPCR.pcr}</div>
            <div className="flex items-center justify-center gap-2 mt-2">
              {pcrTrend === "up" ? (
                <TrendingUp className="w-4 h-4 text-bearish" />
              ) : (
                <TrendingDown className="w-4 h-4 text-bullish" />
              )}
              <span className="text-sm text-muted-foreground">Current PCR</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Market Sentiment</span>
                <span
                  className={`font-medium ${
                    currentPCR.sentiment === "Bullish"
                      ? "text-bullish"
                      : currentPCR.sentiment === "Bearish"
                        ? "text-bearish"
                        : "text-muted-foreground"
                  }`}
                >
                  {currentPCR.sentiment}
                </span>
              </div>
              <Progress
                value={currentPCR.sentiment === "Bullish" ? 75 : currentPCR.sentiment === "Bearish" ? 25 : 50}
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground">Bullish</p>
                <p className="font-bold text-bullish">&lt; 0.8</p>
              </div>
              <div>
                <p className="text-muted-foreground">Neutral</p>
                <p className="font-bold">0.8 - 1.2</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bearish</p>
                <p className="font-bold text-bearish">&gt; 1.2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market Sentiment Distribution</CardTitle>
          <CardDescription>Overall market sentiment breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Derivatives() {
  const [selectedIndex, setSelectedIndex] = useState("nifty")

  return (
    <div className="space-y-6">
      {/* PCR Analysis */}
      <PCRAnalysis />

      {/* OI Flow Analysis */}
      <Tabs value={selectedIndex} onValueChange={setSelectedIndex}>
        <TabsList>
          <TabsTrigger value="nifty">Nifty 50</TabsTrigger>
          <TabsTrigger value="banknifty">Bank Nifty</TabsTrigger>
        </TabsList>

        <TabsContent value="nifty" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <OIChart data={oiData} title="Nifty 50" />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Levels</CardTitle>
                  <CardDescription>Important support and resistance levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Max Call OI</span>
                      <span className="font-bold">24,250</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Max Put OI</span>
                      <span className="font-bold">24,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">PCR</span>
                      <span className="font-bold text-bullish">0.81</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Call OI</span>
                      <span className="font-bold">1.2M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Put OI</span>
                      <span className="font-bold">0.97M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <OIFlowTable data={oiData} title="Nifty 50" />
        </TabsContent>

        <TabsContent value="banknifty" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <OIChart data={bankNiftyOIData} title="Bank Nifty" />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Levels</CardTitle>
                  <CardDescription>Important support and resistance levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Max Call OI</span>
                      <span className="font-bold">51,300</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Max Put OI</span>
                      <span className="font-bold">51,300</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">PCR</span>
                      <span className="font-bold text-bullish">0.89</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Call OI</span>
                      <span className="font-bold">0.68M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Put OI</span>
                      <span className="font-bold">0.61M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <OIFlowTable data={bankNiftyOIData} title="Bank Nifty" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
