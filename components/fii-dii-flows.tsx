"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function FIIDIIFlows() {
  // Mock FII/DII flows data
  const flowsData = [
    {
      date: "2024-01-25",
      fiiIndexFuturesBuy: 2850,
      fiiIndexFuturesSell: 2650,
      fiiIndexFuturesNet: 200,
      fiiIndexOptionsNetCalls: 1250,
      fiiIndexOptionsNetPuts: -850,
      diiCashNet: 1850,
      rollingNet: 3200,
      cumulativeNet: 15600,
    },
    {
      date: "2024-01-24",
      fiiIndexFuturesBuy: 3200,
      fiiIndexFuturesSell: 2950,
      fiiIndexFuturesNet: 250,
      fiiIndexOptionsNetCalls: 1450,
      fiiIndexOptionsNetPuts: -950,
      diiCashNet: 2150,
      rollingNet: 3400,
      cumulativeNet: 15400,
    },
    {
      date: "2024-01-23",
      fiiIndexFuturesBuy: 2950,
      fiiIndexFuturesSell: 3150,
      fiiIndexFuturesNet: -200,
      fiiIndexOptionsNetCalls: 950,
      fiiIndexOptionsNetPuts: -650,
      diiCashNet: 1650,
      rollingNet: 2800,
      cumulativeNet: 15150,
    },
    {
      date: "2024-01-22",
      fiiIndexFuturesBuy: 2750,
      fiiIndexFuturesSell: 2850,
      fiiIndexFuturesNet: -100,
      fiiIndexOptionsNetCalls: 850,
      fiiIndexOptionsNetPuts: -750,
      diiCashNet: 1950,
      rollingNet: 2950,
      cumulativeNet: 15350,
    },
    {
      date: "2024-01-19",
      fiiIndexFuturesBuy: 3150,
      fiiIndexFuturesSell: 2850,
      fiiIndexFuturesNet: 300,
      fiiIndexOptionsNetCalls: 1350,
      fiiIndexOptionsNetPuts: -1050,
      diiCashNet: 2250,
      rollingNet: 3500,
      cumulativeNet: 15450,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>FII/DII Flows Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>FII Index Futures Buy</TableHead>
                  <TableHead>FII Index Futures Sell</TableHead>
                  <TableHead>FII Index Futures Net</TableHead>
                  <TableHead>FII Options Net Calls</TableHead>
                  <TableHead>FII Options Net Puts</TableHead>
                  <TableHead>DII Cash Net</TableHead>
                  <TableHead>Rolling Net (5D)</TableHead>
                  <TableHead>Cumulative Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flowsData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell className="text-bullish">₹{row.fiiIndexFuturesBuy} Cr</TableCell>
                    <TableCell className="text-bearish">₹{row.fiiIndexFuturesSell} Cr</TableCell>
                    <TableCell
                      className={`font-medium ${row.fiiIndexFuturesNet > 0 ? "text-bullish" : "text-bearish"}`}
                    >
                      ₹{row.fiiIndexFuturesNet > 0 ? "+" : ""}
                      {row.fiiIndexFuturesNet} Cr
                    </TableCell>
                    <TableCell className="text-bullish">₹{row.fiiIndexOptionsNetCalls} Cr</TableCell>
                    <TableCell className="text-bearish">₹{row.fiiIndexOptionsNetPuts} Cr</TableCell>
                    <TableCell className={`font-medium ${row.diiCashNet > 0 ? "text-bullish" : "text-bearish"}`}>
                      ₹{row.diiCashNet > 0 ? "+" : ""}
                      {row.diiCashNet} Cr
                    </TableCell>
                    <TableCell className={`font-medium ${row.rollingNet > 0 ? "text-bullish" : "text-bearish"}`}>
                      ₹{row.rollingNet > 0 ? "+" : ""}
                      {row.rollingNet} Cr
                    </TableCell>
                    <TableCell className={`font-bold ${row.cumulativeNet > 0 ? "text-bullish" : "text-bearish"}`}>
                      ₹{row.cumulativeNet > 0 ? "+" : ""}
                      {row.cumulativeNet} Cr
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today's FII Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bullish">₹200 Cr</div>
            <p className="text-sm text-muted-foreground">Index Futures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today's DII Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bullish">₹1,850 Cr</div>
            <p className="text-sm text-muted-foreground">Cash Segment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">5-Day Rolling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bullish">₹3,200 Cr</div>
            <p className="text-sm text-muted-foreground">Combined Net</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Cumulative</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bullish">₹15,600 Cr</div>
            <p className="text-sm text-muted-foreground">Total Inflows</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
