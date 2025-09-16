"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function SectorRanking() {
  // Mock sector ranking data
  const sectorData = [
    {
      sector: "Banking",
      rank: 1,
      momentum: "Strong Bullish",
      advDecl: "15/3",
      topConstituents: "HDFC Bank (+2.1%), ICICI Bank (+1.8%)",
    },
    {
      sector: "IT",
      rank: 2,
      momentum: "Bullish",
      advDecl: "12/8",
      topConstituents: "TCS (+1.5%), Infosys (+1.2%)",
    },
    {
      sector: "Auto",
      rank: 3,
      momentum: "Neutral",
      advDecl: "8/7",
      topConstituents: "M&M (+0.8%), Tata Motors (+0.5%)",
    },
    {
      sector: "Pharma",
      rank: 4,
      momentum: "Bearish",
      advDecl: "5/10",
      topConstituents: "Sun Pharma (-0.5%), Dr Reddy's (-1.2%)",
    },
    {
      sector: "FMCG",
      rank: 5,
      momentum: "Weak Bearish",
      advDecl: "3/12",
      topConstituents: "HUL (-1.8%), Nestle (-2.1%)",
    },
    {
      sector: "Metal",
      rank: 6,
      momentum: "Strong Bearish",
      advDecl: "2/13",
      topConstituents: "Tata Steel (-2.5%), JSW Steel (-3.1%)",
    },
  ]

  const getMomentumColor = (momentum: string) => {
    if (momentum.includes("Strong Bullish")) return "default"
    if (momentum.includes("Bullish")) return "default"
    if (momentum.includes("Neutral")) return "secondary"
    if (momentum.includes("Bearish")) return "destructive"
    if (momentum.includes("Strong Bearish")) return "destructive"
    return "secondary"
  }

  const getMomentumBg = (momentum: string) => {
    if (momentum.includes("Strong Bullish")) return "bg-green-100 dark:bg-green-950"
    if (momentum.includes("Bullish")) return "bg-green-50 dark:bg-green-900"
    if (momentum.includes("Neutral")) return "bg-yellow-50 dark:bg-yellow-950"
    if (momentum.includes("Bearish")) return "bg-red-50 dark:bg-red-900"
    if (momentum.includes("Strong Bearish")) return "bg-red-100 dark:bg-red-950"
    return ""
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sector Performance Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Momentum</TableHead>
                  <TableHead>Adv/Decl</TableHead>
                  <TableHead>Top Constituents by Move</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectorData.map((row) => (
                  <TableRow key={row.sector} className={getMomentumBg(row.momentum)}>
                    <TableCell className="font-bold text-lg">{row.rank}</TableCell>
                    <TableCell className="font-medium">{row.sector}</TableCell>
                    <TableCell>
                      <Badge variant={getMomentumColor(row.momentum)}>{row.momentum}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{row.advDecl}</TableCell>
                    <TableCell className="text-sm">{row.topConstituents}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sector Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bullish">Banking</div>
            <p className="text-sm text-muted-foreground">Strong institutional buying</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Worst Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bearish">Metal</div>
            <p className="text-sm text-muted-foreground">Commodity price pressure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Market Breadth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45/55</div>
            <p className="text-sm text-muted-foreground">Advances/Declines</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
