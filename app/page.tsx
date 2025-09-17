"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Activity, BarChart3, TrendingUp, Users, Target, Settings2, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import OptionChain from "@/components/option-chain"
import PCRIntraday from "@/components/pcr-intraday"
import OIAnalytics from "@/components/oi-analytics"
import FIIDIIFlows from "@/components/fii-dii-flows"
import MaxPainSummary from "@/components/max-pain-summary"
import OptionDataIndicator from "@/components/option-data-indicator"
import Dashboard from "@/components/dashboard"
import { fetchStockIndexData, fetchPCRData, fetchTodaySpotData, getSymbolForAPI, formatNumber, generateStrikePrices } from "@/lib/api"

// Custom Strike Selector Component with suggestions
function StrikeSelector({ value, onChange, currentPrice }: {
  value: string,
  onChange: (value: string) => void,
  currentPrice: number
}) {
  const [inputValue, setInputValue] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Generate strike price suggestions based on current market price
  const generateSuggestions = (basePrice: number) => {
    const suggestions = []

    // Round basePrice to nearest 50
    const roundedBase = Math.round(basePrice / 50) * 50

    // Generate strikes from roundedBase - 10 strikes to roundedBase + 10 strikes (50-point gaps)
    for (let i = -10; i <= 10; i++) {
      const strike = roundedBase + (i * 50)
      if (strike > 0) suggestions.push(strike.toString())
    }

    return suggestions
  }

  const suggestions = generateSuggestions(currentPrice)

  // Filter suggestions based on input
  const getFilteredSuggestions = () => {
    if (!inputValue.trim()) return suggestions.slice(0, 50) // Show first 30 if no input

    const lastPart = inputValue.split(',').pop()?.trim() || ''
    if (!lastPart) return suggestions.slice(0, 50) // Show 30 suggestions after comma

    return suggestions.filter(strike =>
      strike.startsWith(lastPart)
    ).slice(0, 50) // Limit to 15 suggestions when typing
  }

  const filteredSuggestions = getFilteredSuggestions()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedIndex(-1)
    setShowSuggestions(true)
    onChange(newValue)
  }

  const handleSuggestionClick = (suggestion: string) => {
    const parts = inputValue.split(',')
    parts[parts.length - 1] = suggestion

    // If this isn't the last part, add comma, otherwise just set it
    const newValue = parts.length > 1 ? parts.slice(0, -1).join(',') + ',' + suggestion : suggestion

    setInputValue(newValue)
    onChange(newValue)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => prev < filteredSuggestions.length - 1 ? prev + 1 : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredSuggestions.length - 1)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(filteredSuggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    } else if (e.key === ',') {
      // Allow comma to be typed normally
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const handleFocus = () => {
    setShowSuggestions(true)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="24550,25000,25100"
        className="mt-1"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${
                index === selectedIndex ? 'bg-muted' : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FynAIPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedInstrument, setSelectedInstrument] = useState("NIFTY")
  const [selectedExpiry, setSelectedExpiry] = useState("")
  const [selectedTimeframe, setSelectedTimeframe] = useState("5")
  const [strikeRange, setStrikeRange] = useState("ATM±10")
  const [strikeMode, setStrikeMode] = useState("range") // range, custom, default
  const [customStrikes, setCustomStrikes] = useState("24550,25000")
  const [rangeStart, setRangeStart] = useState("24500")
  const [rangeEnd, setRangeEnd] = useState("25000")
  const [isStrikeModalOpen, setIsStrikeModalOpen] = useState(false)
  const [expiryOptions, setExpiryOptions] = useState<any[]>([])
  const [activeStrikeRange, setActiveStrikeRange] = useState("")
  const [refreshEnabled, setRefreshEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [marketData, setMarketData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch data function (extracted from useEffect for reuse)
  const fetchMarketData = async () => {
    try {
      setLoading(true)
      const [stockData, pcrData, niftySpotData, bankNiftySpotData] = await Promise.all([
        fetchStockIndexData(),
        fetchPCRData(getSymbolForAPI(selectedInstrument)),
        fetchTodaySpotData('nifty'),
        fetchTodaySpotData('banknifty')
      ])

      const niftyData = stockData.find(item => item.symbol_name === "NIFTY 50")
      const bankNiftyData = stockData.find(item => item.symbol_name === "NIFTY BANK")
      const latestPCR = pcrData.length > 0 ? pcrData[pcrData.length - 1] : null

      // Generate weekly expiry options
      const expiryData = generateWeeklyExpiryDates()
      setExpiryOptions(expiryData)
      if (expiryData.length > 0 && !selectedExpiry) {
        setSelectedExpiry(expiryData[0].expiry)
      }

      // Initialize active strike range if not set
      if (!activeStrikeRange) {
        const initialStrikeValue = generateStrikePrices(
          selectedInstrument === "NIFTY" ? niftyData?.last_trade_price || 25000 : bankNiftyData?.last_trade_price || 25000,
          strikeRange
        )
        setActiveStrikeRange(initialStrikeValue)
      }

      setMarketData({
        nifty: {
          price: niftyData?.last_trade_price || 0,
          change: niftyData?.change_value || 0,
          changePercent: niftyData?.change_per || 0,
          high: niftyData?.high || 0,
          low: niftyData?.low || 0,
          maxPain: niftySpotData?.max_pain || niftyData?.max_pain || 0,
          high52: niftyData?.high52 || 0,
          low52: niftyData?.low52 || 0,
        },
        bankNifty: {
          price: bankNiftyData?.last_trade_price || 0,
          change: bankNiftyData?.change_value || 0,
          changePercent: bankNiftyData?.change_per || 0,
          high: bankNiftyData?.high || 0,
          low: bankNiftyData?.low || 0,
          maxPain: bankNiftySpotData?.max_pain || bankNiftyData?.max_pain || 0,
          high52: bankNiftyData?.high52 || 0,
          low52: bankNiftyData?.low52 || 0,
        },
        putCallRatio: {
          value: latestPCR?.pcr || 0,
          signal: latestPCR && latestPCR.pcr < 1 ? "Bullish" : latestPCR && latestPCR.pcr > 1.2 ? "Bearish" : "Neutral"
        },
        changeOIPCR: latestPCR?.change_oi_pcr || 0,
        volumePCR: latestPCR?.volume_pcr || 0,
        marketSentiment: stockData.filter(item => item.change_per > 0).length > stockData.length / 2 ? "Bullish" : "Bearish",
        keyLevels: {
          support: niftyData ? Math.floor(niftyData.low / 50) * 50 : 0,
          resistance: niftyData ? Math.ceil(niftyData.high / 50) * 50 : 0,
        },
      })
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchMarketData()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Generate weekly expiry dates starting from next available expiry
  const generateWeeklyExpiryDates = (): any[] => {
    const expiryDates = []

    // Start from September 23, 2025 as mentioned by user
    const startDate = new Date('2025-09-23')

    // Generate next 8 weekly expiry dates (every 7 days)
    for (let i = 0; i < 8; i++) {
      const expiryDate = new Date(startDate)
      expiryDate.setDate(startDate.getDate() + (i * 7))

      const dateStr = expiryDate.toISOString().split('T')[0]
      const month = dateStr.slice(5, 7)
      const day = dateStr.slice(8, 10)

      expiryDates.push({
        expiry: dateStr + 'T00:00:00',
        trading_symbol: `NIFTY${month}${day}FUT`,
        expiry_date: dateStr
      })
    }

    return expiryDates
  }

  // Fetch live market data and expiry options
  useEffect(() => {
    fetchMarketData()
    // Configurable auto-refresh
    let interval: NodeJS.Timeout | null = null
    if (refreshEnabled && refreshInterval > 0) {
      interval = setInterval(fetchMarketData, refreshInterval * 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [selectedInstrument, selectedExpiry, refreshEnabled, refreshInterval])



  const MobileControls = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden bg-transparent">
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-md h-full overflow-y-auto p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/20">
            <h2 className="text-lg font-semibold text-center">Trading Controls</h2>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-6 space-y-6">
            {/* Refresh Controls */}
            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Refresh Settings
                </Label>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="w-full h-11 justify-center bg-background"
                  >
                    <Activity className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Manual Refresh'}
                  </Button>
                </div>

                <div className="text-center">
                  <Label className="text-xs font-medium mb-2 block text-muted-foreground">Auto Refresh</Label>
                  <div className="flex items-center justify-center space-x-2">
                    <input
                      type="checkbox"
                      id="mobile-refresh-enabled"
                      checked={refreshEnabled}
                      onChange={(e) => setRefreshEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="mobile-refresh-enabled" className="text-sm font-medium">
                      Enable
                    </Label>
                  </div>
                </div>

                <div className="text-center">
                  <Label className="text-xs font-medium mb-2 block text-muted-foreground">Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Math.max(5, parseInt(e.target.value) || 30))}
                    min="5"
                    max="300"
                    className="w-full h-11 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Primary Controls - Centered Layout */}
            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Market Selection
                </Label>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="text-center">
                  <Label className="text-xs font-medium mb-2 block text-muted-foreground">Instrument</Label>
                  <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                    <SelectTrigger className="w-full h-11 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NIFTY">NIFTY</SelectItem>
                      <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center">
                  <Label className="text-xs font-medium mb-2 block text-muted-foreground">Expiry Date</Label>
                  <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                    <SelectTrigger className="w-full h-11 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                  {expiryOptions.map((expiry) => (
                    <SelectItem key={expiry.expiry} value={expiry.expiry}>
                      {new Date(expiry.expiry).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </SelectItem>
                  ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center">
                  <Label className="text-xs font-medium mb-2 block text-muted-foreground">Timeframe</Label>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-full h-11 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Strike Filter Section */}
            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Strike Configuration
                </Label>
              </div>

              <div className="text-center">
                <Popover open={isStrikeModalOpen} onOpenChange={setIsStrikeModalOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-11 justify-center bg-background">
                      <Settings2 className="w-4 h-4 mr-2" />
                      Configure Strikes
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-90" side="bottom" align="center" sideOffset={8} collisionPadding={16}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Strike Configuration</h4>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Strike Selection Mode</Label>
                        <Select value={strikeMode} onValueChange={setStrikeMode}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default (ATM±)</SelectItem>
                            <SelectItem value="range">Range Selection</SelectItem>
                            <SelectItem value="custom">Custom Strikes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {strikeMode === "default" && (
                        <div>
                          <Label className="text-sm font-medium">ATM Range</Label>
                          <Select value={strikeRange} onValueChange={setStrikeRange}>
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ATM±5">ATM±5</SelectItem>
                              <SelectItem value="ATM±10">ATM±10</SelectItem>
                              <SelectItem value="ATM±15">ATM±15</SelectItem>
                              <SelectItem value="ATM±20">ATM±20</SelectItem>
                              <SelectItem value="ALL">All Strikes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {strikeMode === "range" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-sm font-medium">Start Strike</Label>
                            <Input
                              type="number"
                              value={rangeStart}
                              onChange={(e) => setRangeStart(e.target.value)}
                              placeholder="24500"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">End Strike</Label>
                            <Input
                              type="number"
                              value={rangeEnd}
                              onChange={(e) => setRangeEnd(e.target.value)}
                              placeholder="25000"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}

                      {strikeMode === "custom" && (
                        <div>
                          <Label className="text-sm font-medium">Custom Strikes</Label>
                          <StrikeSelector
                            value={customStrikes}
                            onChange={setCustomStrikes}
                            currentPrice={selectedInstrument === "NIFTY" ? marketData?.nifty?.price : marketData?.bankNifty?.price || 25000}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Type or select strike prices. Use commas to separate multiple values.
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end pt-2 border-t">
                        <Button onClick={() => {
                          // Calculate and set the active strike range based on current selections
                          const currentPrice = selectedInstrument === "NIFTY" ? marketData?.nifty?.price : marketData?.bankNifty?.price || 25000

                          let newStrikeRange = ""
                          if (strikeMode === "range") {
                            const start = parseInt(rangeStart) || currentPrice - 500
                            const end = parseInt(rangeEnd) || currentPrice + 500
                            const strikes = []
                            for (let i = start; i <= end; i += 50) {
                              strikes.push(i)
                            }
                            newStrikeRange = strikes.join(',')
                          } else if (strikeMode === "custom") {
                            newStrikeRange = customStrikes
                          } else {
                            newStrikeRange = generateStrikePrices(currentPrice, strikeRange)
                          }

                          setActiveStrikeRange(newStrikeRange)
                          setIsStrikeModalOpen(false)
                        }} className="w-full">
                          Save & Close
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Current Selection Display */}
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Current Selection</p>
                <div className="overflow-x-auto">
                  <p className="text-xs font-medium whitespace-nowrap">{activeStrikeRange}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-muted/10">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live Market Data
              </Badge>
              <div className="text-xs text-muted-foreground">
                {refreshEnabled
                  ? `Auto refresh: ${refreshInterval}s`
                  : 'Auto refresh: Disabled'
                }
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
                  FynAI Option Intelligence
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">By NiksLogy • fynai.tech</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {/* Refresh Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="bg-transparent"
                >
                  <Activity className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Auto Refresh Settings</h4>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="refresh-enabled"
                          checked={refreshEnabled}
                          onChange={(e) => setRefreshEnabled(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="refresh-enabled" className="text-sm font-medium">
                          Enable auto refresh
                        </Label>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Refresh interval (seconds)</Label>
                        <Input
                          type="number"
                          value={refreshInterval}
                          onChange={(e) => setRefreshInterval(Math.max(5, parseInt(e.target.value) || 30))}
                          min="5"
                          max="300"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum 5 seconds, maximum 300 seconds (5 minutes)
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                        <div className="flex items-center justify-between">
                          <span>
                            {refreshEnabled
                              ? `Auto refresh: ${refreshInterval}s`
                              : 'Auto refresh: Disabled'
                            }
                          </span>
                          <Badge variant="outline" className="text-xs">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                            Live
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Popover open={isStrikeModalOpen} onOpenChange={setIsStrikeModalOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-32 bg-transparent">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Strike Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Strike Configuration</h4>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Strike Selection Mode</Label>
                      <Select value={strikeMode} onValueChange={setStrikeMode}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default (ATM±)</SelectItem>
                          <SelectItem value="range">Range Selection</SelectItem>
                          <SelectItem value="custom">Custom Strikes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {strikeMode === "default" && (
                      <div>
                        <Label className="text-sm font-medium">ATM Range</Label>
                        <Select value={strikeRange} onValueChange={setStrikeRange}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ATM±5">ATM±5</SelectItem>
                            <SelectItem value="ATM±10">ATM±10</SelectItem>
                            <SelectItem value="ATM±15">ATM±15</SelectItem>
                            <SelectItem value="ATM±20">ATM±20</SelectItem>
                            <SelectItem value="ALL">All Strikes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {strikeMode === "range" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm font-medium">Start Strike</Label>
                          <Input
                            type="number"
                            value={rangeStart}
                            onChange={(e) => setRangeStart(e.target.value)}
                            placeholder="24500"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">End Strike</Label>
                          <Input
                            type="number"
                            value={rangeEnd}
                            onChange={(e) => setRangeEnd(e.target.value)}
                            placeholder="25000"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {strikeMode === "custom" && (
                      <div>
                        <Label className="text-sm font-medium">Custom Strikes</Label>
                        <StrikeSelector
                          value={customStrikes}
                          onChange={setCustomStrikes}
                          currentPrice={selectedInstrument === "NIFTY" ? marketData?.nifty?.price : marketData?.bankNifty?.price || 25000}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Type or select strike prices. Use commas to separate multiple values.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-2 border-t">
                      <Button onClick={() => {
                        // Calculate and set the active strike range based on current selections
                        const currentPrice = selectedInstrument === "NIFTY" ? marketData?.nifty?.price : marketData?.bankNifty?.price || 25000

                        let newStrikeRange = ""
                        if (strikeMode === "range") {
                          const start = parseInt(rangeStart) || currentPrice - 500
                          const end = parseInt(rangeEnd) || currentPrice + 500
                          const strikes = []
                          for (let i = start; i <= end; i += 50) {
                            strikes.push(i)
                          }
                          newStrikeRange = strikes.join(',')
                        } else if (strikeMode === "custom") {
                          newStrikeRange = customStrikes
                        } else {
                          newStrikeRange = generateStrikePrices(currentPrice, strikeRange)
                        }

                        setActiveStrikeRange(newStrikeRange)
                        setIsStrikeModalOpen(false)
                      }} className="w-full">
                        Save & Close
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1m</SelectItem>
                  <SelectItem value="3">3m</SelectItem>
                  <SelectItem value="5">5m</SelectItem>
                  <SelectItem value="15">15m</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NIFTY">NIFTY</SelectItem>
                  <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expiryOptions.map((expiry) => (
                    <SelectItem key={expiry.expiry} value={expiry.expiry}>
                      {new Date(expiry.expiry).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {marketData && (
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm px-3 py-1 bg-background text-foreground border-border"
                >
                  Market Sentiment: {marketData.marketSentiment}
                </Badge>
              )}

              {/* Current Selection Display - Desktop */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Strikes
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Current Strike Selection</h4>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Selected Strikes</p>
                      <div className="overflow-x-auto">
                        <p className="text-sm font-medium whitespace-nowrap font-mono">{activeStrikeRange}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      These strikes are used for PCR Intraday analysis
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2 md:hidden">
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
              <MobileControls />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              Quick Market Overview
              {loading && <div className="w-2 h-2 bg-primary rounded-full animate-pulse ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3 sm:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="text-center p-3 bg-muted/30 rounded-lg animate-pulse">
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-5 bg-muted rounded mb-1"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : marketData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3 sm:gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">NIFTY 50</p>
                  <p className="text-base sm:text-lg font-bold">{formatNumber(marketData.nifty.price, 0)}</p>
                  <p className={`text-xs sm:text-sm ${marketData.nifty.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {marketData.nifty.change > 0 ? "+" : ""}
                    {formatNumber(marketData.nifty.change, 2)} ({formatNumber(marketData.nifty.changePercent, 2)}%)
                  </p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">BANK NIFTY</p>
                  <p className="text-base sm:text-lg font-bold">{formatNumber(marketData.bankNifty.price, 0)}</p>
                  <p
                    className={`text-xs sm:text-sm ${marketData.bankNifty.change > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {marketData.bankNifty.change > 0 ? "+" : ""}
                    {formatNumber(marketData.bankNifty.change, 2)} ({formatNumber(marketData.bankNifty.changePercent, 2)}%)
                  </p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Day High</p>
                  <p className="text-base sm:text-lg font-bold text-green-600">
                    {formatNumber(selectedInstrument === "NIFTY" ? marketData.nifty.high : marketData.bankNifty.high, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedInstrument}</p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Day Low</p>
                  <p className="text-base sm:text-lg font-bold text-red-600">
                    {formatNumber(selectedInstrument === "NIFTY" ? marketData.nifty.low : marketData.bankNifty.low, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedInstrument}</p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Volume PCR</p>
                  <p className="text-base sm:text-lg font-bold">{formatNumber(marketData.volumePCR, 3)}</p>
                  <p className="text-xs text-muted-foreground">Live</p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">PCR</p>
                  <p className="text-base sm:text-lg font-bold">{formatNumber(marketData.putCallRatio.value, 3)}</p>
                  <p
                    className={`text-xs sm:text-sm ${marketData.putCallRatio.signal === "Bullish" ? "text-green-600" : marketData.putCallRatio.signal === "Bearish" ? "text-red-600" : "text-yellow-600"}`}
                  >
                    {marketData.putCallRatio.signal}
                  </p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Max Pain</p>
                  <p className="text-base sm:text-lg font-bold">
                    {formatNumber(selectedInstrument === "NIFTY" ? marketData.nifty.maxPain : marketData.bankNifty.maxPain, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Strike Level</p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Change OI PCR</p>
                  <p className={`text-base sm:text-lg font-bold ${marketData.changeOIPCR > 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatNumber(marketData.changeOIPCR, 2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Live</p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Support</p>
                  <p className="text-base sm:text-lg font-bold text-green-600">{formatNumber(marketData.keyLevels.support, 0)}</p>
                  <p className="text-xs text-muted-foreground">Key Level</p>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Resistance</p>
                  <p className="text-base sm:text-lg font-bold text-red-600">{formatNumber(marketData.keyLevels.resistance, 0)}</p>
                  <p className="text-xs text-muted-foreground">Key Level</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Failed to load market data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4 sm:mb-6">
            <div className="block sm:hidden">
              <Card className="mb-4 border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <Label className="text-sm font-semibold text-foreground">Analysis Tools</Label>
                  </div>

                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full h-12 bg-background/50 border-border/60 hover:border-primary/40 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/60">
                      <div className="flex items-center gap-3 w-full px-2">
                        <div className="flex-shrink-0">
                          {activeTab === "dashboard" && <Activity className="w-4 h-4 text-primary" />}
                          {activeTab === "option-chain" && <BarChart3 className="w-4 h-4 text-primary" />}
                          {activeTab === "pcr-intraday" && <Activity className="w-4 h-4 text-primary" />}
                          {activeTab === "oi-analytics" && <TrendingUp className="w-4 h-4 text-primary" />}
                          {activeTab === "option-data-indicator" && <Target className="w-4 h-4 text-primary" />}
                          {activeTab === "fii-dii" && <Users className="w-4 h-4 text-primary" />}
                          {activeTab === "max-pain" && <Target className="w-4 h-4 text-primary" />}
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-sm leading-tight truncate">
                            {activeTab === "dashboard" && "Dashboard"}
                            {activeTab === "option-chain" && "Option Chain"}
                            {activeTab === "pcr-intraday" && "PCR Intraday"}
                            {activeTab === "oi-analytics" && "OI Analytics"}
                            {activeTab === "option-data-indicator" && "Data Indicator"}
                            {activeTab === "fii-dii" && "FII/DII Flows"}
                            {activeTab === "max-pain" && "Max Pain"}
                          </div>
                          <div className="text-xs text-muted-foreground leading-tight truncate">
                            {activeTab === "dashboard" && "Market overview & charts"}
                            {activeTab === "option-chain" && "Live option prices & Greeks"}
                            {activeTab === "pcr-intraday" && "Put-Call ratio analysis"}
                            {activeTab === "oi-analytics" && "Open interest insights"}
                            {activeTab === "option-data-indicator" && "Strike-wise data analysis"}
                            {activeTab === "fii-dii" && "Institutional money flow"}
                            {activeTab === "max-pain" && "Maximum pain analysis"}
                          </div>
                        </div>
                      </div>
                    </SelectTrigger>

                    <SelectContent className="w-full max-h-[60vh] overflow-y-auto">
                      <SelectItem
                        value="dashboard"
                        className="h-14 cursor-pointer focus:bg-primary/5 hover:bg-primary/5 data-[state=checked]:text-black"
                      >
                        <div className="flex items-center gap-3 w-full py-1">
                          <Activity className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium text-sm leading-tight">Dashboard</span>
                            <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                              Market overview & charts
                            </span>
                          </div>
                        </div>
                      </SelectItem>

                      <SelectItem
                        value="option-chain"
                        className="h-14 cursor-pointer focus:bg-primary/5 hover:bg-primary/5 data-[state=checked]:text-black"
                      >
                        <div className="flex items-center gap-3 w-full py-1">
                          <BarChart3 className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium text-sm leading-tight">Option Chain</span>
                            <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                              Live option prices & Greeks
                            </span>
                          </div>
                        </div>
                      </SelectItem>

                      <SelectItem
                        value="pcr-intraday"
                        className="h-14 cursor-pointer focus:bg-primary/5 hover:bg-primary/5 data-[state=checked]:text-black"
                      >
                        <div className="flex items-center gap-3 w-full py-1">
                          <Activity className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium text-sm leading-tight">PCR Intraday</span>
                            <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                              Put-Call ratio analysis
                            </span>
                          </div>
                        </div>
                      </SelectItem>

                      <SelectItem
                        value="oi-analytics"
                        className="h-14 cursor-pointer focus:bg-primary/5 hover:bg-primary/5 data-[state=checked]:text-black"
                      >
                        <div className="flex items-center gap-3 w-full py-1">
                          <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium text-sm leading-tight">OI Analytics</span>
                            <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                              Open interest insights
                            </span>
                          </div>
                        </div>
                      </SelectItem>

                      <SelectItem
                        value="option-data-indicator"
                        className="h-14 cursor-pointer focus:bg-primary/5 hover:bg-primary/5 data-[state=checked]:text-black"
                      >
                        <div className="flex items-center gap-3 w-full py-1">
                          <Target className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium text-sm leading-tight">Data Indicator</span>
                            <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                              Strike-wise data analysis
                            </span>
                          </div>
                        </div>
                      </SelectItem>

                      <SelectItem value="fii-dii" className="h-14 cursor-pointer focus:bg-primary/5 hover:bg-primary/5 data-[state=checked]:text-black">
                        <div className="flex items-center gap-3 w-full py-1">
                          <Users className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium text-sm leading-tight">FII/DII Flows</span>
                            <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                              Institutional money flow
                            </span>
                          </div>
                        </div>
                      </SelectItem>

                      <SelectItem
                        value="max-pain"
                        className="h-14 cursor-pointer focus:bg-primary/5 hover:bg-primary/5 data-[state=checked]:text-black"
                      >
                        <div className="flex items-center gap-3 w-full py-1">
                          <Target className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium text-sm leading-tight">Max Pain</span>
                            <span className="text-xs text-muted-foreground leading-tight truncate w-full">
                              Maximum pain analysis
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/80 bg-muted/20 px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" />
                      <span>Tap to switch</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TabsList className="hidden sm:grid w-full grid-cols-7">
              <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </TabsTrigger>
              <TabsTrigger value="option-chain" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Option Chain</span>
                <span className="sm:hidden">Chain</span>
              </TabsTrigger>
              <TabsTrigger value="pcr-intraday" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">PCR Intraday</span>
                <span className="sm:hidden">PCR</span>
              </TabsTrigger>
              <TabsTrigger value="oi-analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">OI Analytics</span>
                <span className="sm:hidden">OI</span>
              </TabsTrigger>
              <TabsTrigger
                value="option-data-indicator"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Data Indicator</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
              <TabsTrigger value="fii-dii" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">FII/DII Flows</span>
                <span className="sm:hidden">FII/DII</span>
              </TabsTrigger>
              <TabsTrigger value="max-pain" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Max Pain</span>
                <span className="sm:hidden">Pain</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="option-chain">
            <OptionChain
              instrument={selectedInstrument}
              expiry={selectedExpiry}
              timeframe={selectedTimeframe}
              strikeRange={activeStrikeRange}
              strikeMode={strikeMode}
            />
          </TabsContent>

          <TabsContent value="pcr-intraday">
            <PCRIntraday
              key={`${selectedInstrument}-${selectedTimeframe}-${activeStrikeRange}-${selectedExpiry}`}
              instrument={selectedInstrument}
              timeframe={selectedTimeframe}
              strikeRange={activeStrikeRange}
              expiry={selectedExpiry}
            />
          </TabsContent>

          <TabsContent value="oi-analytics">
            <OIAnalytics
              instrument={selectedInstrument}
              expiry={selectedExpiry}
              timeframe={selectedTimeframe}
              strikeRange={activeStrikeRange}
            />
          </TabsContent>

          <TabsContent value="fii-dii">
            <FIIDIIFlows />
          </TabsContent>

          <TabsContent value="max-pain">
            <MaxPainSummary instrument={selectedInstrument} expiry={selectedExpiry} timeframe={selectedTimeframe} />
          </TabsContent>

          <TabsContent value="option-data-indicator">
            <OptionDataIndicator
              instrument={selectedInstrument}
              expiry={selectedExpiry}
              timeframe={selectedTimeframe}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
