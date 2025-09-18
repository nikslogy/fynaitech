"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Info, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchOptionChainCalculatorData, OptionChainData } from "@/lib/api"

interface OptionDataIndicatorProps {
  instrument: string
  expiry: string
  strikeRange?: string
  refreshKey?: number
}

export default function OptionDataIndicator({ instrument, expiry, strikeRange, refreshKey }: OptionDataIndicatorProps) {
  const [sortBy, setSortBy] = useState("change_oi")
  const [sortOrder, setSortOrder] = useState("desc")
  const [optionData, setOptionData] = useState<OptionChainData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchOptionChainCalculatorData(
          instrument.toLowerCase(),
          expiry,
          '09:20:00', // Default time
          '20', // atmBelow
          '20'  // atmAbove
        )

        if (data.length === 0) {
          setError("No data available for the selected parameters")
        } else {
          setOptionData(data)
        }
      } catch (err) {
        setError("Failed to fetch option data")
        console.error("Error fetching option data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [instrument, expiry, strikeRange, refreshKey])

  // Parse strike range into array of numbers
  const parseStrikeRange = (range: string): number[] => {
    if (!range || range === "ATM±20" || range === "ALL") return []

    try {
      // Split by comma and parse each strike price
      return range.split(',').map(strike => {
        const num = parseInt(strike.trim())
        return isNaN(num) ? 0 : num
      }).filter(num => num > 0)
    } catch (error) {
      console.error('Error parsing strike range:', error)
      return []
    }
  }

  const selectedStrikes = parseStrikeRange(strikeRange || "")

  // Filter and sort data
  const filteredData = optionData.filter(item => {
    // Filter by selected strikes if any are specified
    if (selectedStrikes.length > 0) {
      if (!selectedStrikes.includes(item.strike_price)) {
        return false
      }
    }

    return true
  })

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue, bValue

    if (sortBy === "change_oi") {
      aValue = a.calls_volume + a.puts_volume
      bValue = b.calls_volume + b.puts_volume
    } else if (sortBy === "strike_price") {
      aValue = a.strike_price
      bValue = b.strike_price
    } else if (sortBy === "pcr") {
      aValue = a.pcr
      bValue = b.pcr
    } else {
      aValue = a.strike_price
      bValue = b.strike_price
    }

    if (sortOrder === "asc") {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })

  // Calculate totals
  const totalCallVolume = sortedData.reduce((sum, item) => sum + item.calls_volume, 0)
  const totalPutVolume = sortedData.reduce((sum, item) => sum + item.puts_volume, 0)
  const totalVolume = totalCallVolume + totalPutVolume

  // Helper functions
  const formatContractName = (instType: string) => {
    // Convert NFO:NIFTY2591624100CE to NIFTY 24100 CE
    const parts = instType.split(':')
    if (parts.length > 1) {
      const symbolPart = parts[1]
      const symbol = symbolPart.substring(0, symbolPart.length - 12) // Remove date and strike part
      const dateStr = symbolPart.substring(symbolPart.length - 12, symbolPart.length - 7) // Extract date
      const strikeStr = symbolPart.substring(symbolPart.length - 7, symbolPart.length - 2) // Extract strike
      const type = symbolPart.substring(symbolPart.length - 2) // CE or PE

      return `${symbol} ${strikeStr} ${type}`
    }
    return instType
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-500"
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{instrument.toUpperCase()} OPTION DATA INDICATOR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading option data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{instrument.toUpperCase()} OPTION DATA INDICATOR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-red-600">{error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>{instrument.toUpperCase()} OPTION DATA INDICATOR</CardTitle>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="change_oi">Volume</SelectItem>
                  <SelectItem value="strike_price">Strike Price</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">High to Low</SelectItem>
                  <SelectItem value="asc">Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <Badge variant={totalVolume > 0 ? "default" : "destructive"} className="mr-2">
              {formatNumber(totalVolume)} Total Volume
            </Badge>
            <Badge variant="outline" className="mr-2">
              {sortedData.length} Strikes
            </Badge>
            {selectedStrikes.length > 0 && (
              <Badge variant="secondary" className="mr-2">
                Filtered: {selectedStrikes.length} Selected
              </Badge>
            )}
            Expiry: {expiry}
          </div>
        </CardHeader>
      </Card>

      {/* Selected Strikes Info */}
      {selectedStrikes.length > 0 && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Selected Strike Prices: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStrikes.map((strike, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {formatNumber(strike)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Option Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls Data */}
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="text-green-700 dark:text-green-400 flex items-center justify-between">
              <span>CALL OPTIONS DATA</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {formatNumber(totalCallVolume)}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-semibold">Contract</TableHead>
                  <TableHead className="text-center font-semibold">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.slice(0, 15).map((item, index) => (
                  <TableRow key={`call-${index}`}>
                    <TableCell className="font-medium text-center">
                      {formatContractName(item.call_inst_type || `CALL ${item.strike_price}`)}
                    </TableCell>
                    <TableCell className={`text-center font-bold flex items-center justify-center gap-1 ${getChangeColor(item.calls_volume)}`}>
                      {getChangeIcon(item.calls_volume)}
                      {formatNumber(item.calls_volume)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-green-50 dark:bg-green-950/20 font-bold">
                  <TableCell className="text-center font-bold">TOTAL CALL VOLUME</TableCell>
                  <TableCell className={`text-center font-bold ${getChangeColor(totalCallVolume)}`}>
                    {formatNumber(totalCallVolume)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Puts Data */}
        <Card>
          <CardHeader className="bg-red-50 dark:bg-red-950/20">
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center justify-between">
              <span>PUT OPTIONS DATA</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {formatNumber(totalPutVolume)}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-semibold">Contract</TableHead>
                  <TableHead className="text-center font-semibold">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.slice(0, 15).map((item, index) => (
                  <TableRow key={`put-${index}`}>
                    <TableCell className="font-medium text-center">
                      {formatContractName(item.put_inst_type || `PUT ${item.strike_price}`)}
                    </TableCell>
                    <TableCell className={`text-center font-bold flex items-center justify-center gap-1 ${getChangeColor(item.puts_volume)}`}>
                      {getChangeIcon(item.puts_volume)}
                      {formatNumber(item.puts_volume)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-red-50 dark:bg-red-950/20 font-bold">
                  <TableCell className="text-center font-bold">TOTAL PUT VOLUME</TableCell>
                  <TableCell className={`text-center font-bold ${getChangeColor(totalPutVolume)}`}>
                    {formatNumber(totalPutVolume)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(totalCallVolume)}`}>
                {formatNumber(totalCallVolume)}
              </div>
              <p className="text-xs text-muted-foreground text-green-700 dark:text-green-400 font-semibold">TOTAL CALL VOLUME</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(totalPutVolume)}`}>
                {formatNumber(totalPutVolume)}
              </div>
              <p className="text-xs text-muted-foreground text-red-700 dark:text-red-400 font-semibold">TOTAL PUT VOLUME</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(totalVolume)}`}>
                {formatNumber(totalVolume)}
              </div>
              <p className="text-xs text-muted-foreground">TOTAL VOLUME</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
