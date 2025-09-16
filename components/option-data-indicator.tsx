"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, ArrowUpDown, Info } from "lucide-react"
import { useState } from "react"

interface OptionDataIndicatorProps {
  instrument: string
  expiry: string
  timeframe: string
}

export default function OptionDataIndicator({ instrument, expiry, timeframe }: OptionDataIndicatorProps) {
  const [sortBy, setSortBy] = useState("quantity")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterType, setFilterType] = useState("all")

  // Sample data based on the image provided
  const niftyData = {
    totalQuantity: -95400,
    callData: [
      { contract: "NIFTYW25000C3", quantity: 2078700 },
      { contract: "NIFTYW25100C3", quantity: -1860075 },
      { contract: "NIFTYW25200C3", quantity: -7237800 },
      { contract: "NIFTYW25300C3", quantity: -7007400 },
    ],
    putData: [
      { contract: "NIFTYW25200P3", quantity: 3883650 },
      { contract: "NIFTYW25100P3", quantity: 10960800 },
      { contract: "NIFTYW25000P3", quantity: 112875 },
      { contract: "NIFTYW24900P3", quantity: -4479600 },
    ],
  }

  const bankNiftyData = {
    totalQuantity: 0,
    callData: [
      { contract: "BANKNIFTYW47000C3", quantity: 1250000 },
      { contract: "BANKNIFTYW47100C3", quantity: -890000 },
      { contract: "BANKNIFTYW47200C3", quantity: -2100000 },
      { contract: "BANKNIFTYW47300C3", quantity: -1800000 },
    ],
    putData: [
      { contract: "BANKNIFTYW47200P3", quantity: 2200000 },
      { contract: "BANKNIFTYW47100P3", quantity: 5400000 },
      { contract: "BANKNIFTYW47000P3", quantity: 75000 },
      { contract: "BANKNIFTYW46900P3", quantity: -2800000 },
    ],
  }

  const currentData = instrument === "NIFTY" ? niftyData : bankNiftyData
  const callTotal = currentData.callData.reduce((sum, item) => sum + item.quantity, 0)
  const putTotal = currentData.putData.reduce((sum, item) => sum + item.quantity, 0)

  const formatQuantity = (quantity: number) => {
    return quantity.toLocaleString()
  }

  const getQuantityColor = (quantity: number) => {
    return quantity > 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>{instrument.toUpperCase()} DATA INDICATOR</CardTitle>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="positive">Positive Only</SelectItem>
                  <SelectItem value="negative">Negative Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <Badge variant={currentData.totalQuantity > 0 ? "default" : "destructive"} className="mr-2">
              {currentData.totalQuantity > 0 ? "+" : ""}
              {formatQuantity(currentData.totalQuantity)} Quantity (in shares)
            </Badge>
            Timeframe: {timeframe}min • Expiry: {expiry}
          </div>
        </CardHeader>
      </Card>

      {/* Option Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls Data */}
        <Card>
          <CardHeader className="bg-red-50 dark:bg-red-950/20">
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center justify-between">
              <span>OPTION DATA INDICATOR (CALL)</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-semibold">{instrument} Call</TableHead>
                  <TableHead className="text-center font-semibold">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.callData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-center">{item.contract}</TableCell>
                    <TableCell className={`text-center font-bold ${getQuantityColor(item.quantity)}`}>
                      {formatQuantity(item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-red-50 dark:bg-red-950/20 font-bold">
                  <TableCell className="text-center font-bold">Total</TableCell>
                  <TableCell className={`text-center font-bold ${getQuantityColor(callTotal)}`}>
                    {formatQuantity(callTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Puts Data */}
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="text-green-700 dark:text-green-400 flex items-center justify-between">
              <span>OPTION DATA INDICATOR (PUT)</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-semibold">{instrument} Put</TableHead>
                  <TableHead className="text-center font-semibold">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.putData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-center">{item.contract}</TableCell>
                    <TableCell className={`text-center font-bold ${getQuantityColor(item.quantity)}`}>
                      {formatQuantity(item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-green-50 dark:bg-green-950/20 font-bold">
                  <TableCell className="text-center font-bold">Total</TableCell>
                  <TableCell className={`text-center font-bold ${getQuantityColor(putTotal)}`}>
                    {formatQuantity(putTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
