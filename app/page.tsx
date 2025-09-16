"use client"

import { useState } from "react"
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

export default function FynAIPage() {
  const [activeTab, setActiveTab] = useState("option-chain")
  const [selectedInstrument, setSelectedInstrument] = useState("NIFTY")
  const [selectedExpiry, setSelectedExpiry] = useState("2024-01-25")
  const [selectedTimeframe, setSelectedTimeframe] = useState("5")
  const [strikeRange, setStrikeRange] = useState("ATM±10")
  const [strikeMode, setStrikeMode] = useState("range") // range, custom, default
  const [customStrikes, setCustomStrikes] = useState("24550,25000")
  const [rangeStart, setRangeStart] = useState("24500")
  const [rangeEnd, setRangeEnd] = useState("25000")
  const [isStrikeModalOpen, setIsStrikeModalOpen] = useState(false)

  const marketData = {
    nifty: {
      price: 25100,
      change: 125.5,
      changePercent: 0.58,
      callVolume: 1.85,
      putVolume: 2.32,
      callOI: 2.45,
      putOI: 3.06,
    },
    bankNifty: {
      price: 47250.3,
      change: -85.2,
      changePercent: -0.18,
      callVolume: 0.95,
      putVolume: 1.12,
      callOI: 1.23,
      putOI: 1.67,
    },
    vix: { price: 12.45, change: -0.85, changePercent: -6.38 },
    putCallRatio: { value: 1.25, signal: "Bullish" },
    maxPain: { nifty: 25000, bankNifty: 47000 },
    totalOI: { calls: 2.45, puts: 3.06, ratio: 0.8 },
    marketSentiment: "Cautiously Bullish",
    keyLevels: { support: 24950, resistance: 25200 },
  }

  const getStrikeRangeValue = () => {
    if (strikeMode === "range") {
      return `${rangeStart}-${rangeEnd}`
    } else if (strikeMode === "custom") {
      return customStrikes
    }
    return strikeRange
  }

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
                      <SelectItem value="2024-01-25">25 Jan 2024</SelectItem>
                      <SelectItem value="2024-02-01">01 Feb 2024</SelectItem>
                      <SelectItem value="2024-02-08">08 Feb 2024</SelectItem>
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
                          <Label className="text-sm font-medium">Custom Strikes (comma separated)</Label>
                          <Input
                            value={customStrikes}
                            onChange={(e) => setCustomStrikes(e.target.value)}
                            placeholder="24550,25000,25100"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Enter strikes separated by commas</p>
                        </div>
                      )}

                      <div className="flex justify-end pt-2 border-t">
                        <Button onClick={() => setIsStrikeModalOpen(false)} className="w-full">
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
                <p className="text-sm font-medium">{getStrikeRangeValue()}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-muted/10">
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live Market Data
              </Badge>
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
                        <Label className="text-sm font-medium">Custom Strikes (comma separated)</Label>
                        <Input
                          value={customStrikes}
                          onChange={(e) => setCustomStrikes(e.target.value)}
                          placeholder="24550,25000,25100"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Enter strikes separated by commas</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-2 border-t">
                      <Button onClick={() => setIsStrikeModalOpen(false)} className="w-full">
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
                  <SelectItem value="2024-01-25">25 Jan 2024</SelectItem>
                  <SelectItem value="2024-02-01">01 Feb 2024</SelectItem>
                  <SelectItem value="2024-02-08">08 Feb 2024</SelectItem>
                </SelectContent>
              </Select>

              <Badge
                variant="outline"
                className="text-xs sm:text-sm px-3 py-1 bg-background text-foreground border-border"
              >
                Market Sentiment: {marketData.marketSentiment}
              </Badge>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">NIFTY 50</p>
                <p className="text-base sm:text-lg font-bold">{marketData.nifty.price.toLocaleString()}</p>
                <p className={`text-xs sm:text-sm ${marketData.nifty.change > 0 ? "text-green-600" : "text-red-600"}`}>
                  {marketData.nifty.change > 0 ? "+" : ""}
                  {marketData.nifty.change} ({marketData.nifty.changePercent}%)
                </p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">BANK NIFTY</p>
                <p className="text-base sm:text-lg font-bold">{marketData.bankNifty.price.toLocaleString()}</p>
                <p
                  className={`text-xs sm:text-sm ${marketData.bankNifty.change > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {marketData.bankNifty.change > 0 ? "+" : ""}
                  {marketData.bankNifty.change} ({marketData.bankNifty.changePercent}%)
                </p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1 truncate">{selectedInstrument} Call Vol</p>
                <p className="text-base sm:text-lg font-bold text-red-600">
                  {selectedInstrument === "NIFTY" ? marketData.nifty.callVolume : marketData.bankNifty.callVolume}M
                </p>
                <p className="text-xs text-muted-foreground">Volume</p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1 truncate">{selectedInstrument} Put Vol</p>
                <p className="text-base sm:text-lg font-bold text-green-600">
                  {selectedInstrument === "NIFTY" ? marketData.nifty.putVolume : marketData.bankNifty.putVolume}M
                </p>
                <p className="text-xs text-muted-foreground">Volume</p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">VIX (Fear)</p>
                <p className="text-base sm:text-lg font-bold">{marketData.vix.price}</p>
                <p className={`text-xs sm:text-sm ${marketData.vix.change > 0 ? "text-red-600" : "text-green-600"}`}>
                  {marketData.vix.change > 0 ? "+" : ""}
                  {marketData.vix.change} ({marketData.vix.changePercent}%)
                </p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">PCR</p>
                <p className="text-base sm:text-lg font-bold">{marketData.putCallRatio.value}</p>
                <p
                  className={`text-xs sm:text-sm ${marketData.putCallRatio.signal === "Bullish" ? "text-green-600" : "text-red-600"}`}
                >
                  {marketData.putCallRatio.signal}
                </p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Max Pain</p>
                <p className="text-base sm:text-lg font-bold">
                  {selectedInstrument === "NIFTY" ? marketData.maxPain.nifty : marketData.maxPain.bankNifty}
                </p>
                <p className="text-xs text-muted-foreground">Strike Level</p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Call OI</p>
                <p className="text-base sm:text-lg font-bold text-red-600">
                  {selectedInstrument === "NIFTY" ? marketData.nifty.callOI : marketData.bankNifty.callOI}M
                </p>
                <p className="text-xs text-muted-foreground">Open Interest</p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Support</p>
                <p className="text-base sm:text-lg font-bold text-green-600">{marketData.keyLevels.support}</p>
                <p className="text-xs text-muted-foreground">Key Level</p>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Resistance</p>
                <p className="text-base sm:text-lg font-bold text-red-600">{marketData.keyLevels.resistance}</p>
                <p className="text-xs text-muted-foreground">Key Level</p>
              </div>
            </div>
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
                          {activeTab === "option-chain" && <BarChart3 className="w-4 h-4 text-primary" />}
                          {activeTab === "pcr-intraday" && <Activity className="w-4 h-4 text-primary" />}
                          {activeTab === "oi-analytics" && <TrendingUp className="w-4 h-4 text-primary" />}
                          {activeTab === "option-data-indicator" && <Target className="w-4 h-4 text-primary" />}
                          {activeTab === "fii-dii" && <Users className="w-4 h-4 text-primary" />}
                          {activeTab === "max-pain" && <Target className="w-4 h-4 text-primary" />}
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-sm leading-tight truncate">
                            {activeTab === "option-chain" && "Option Chain"}
                            {activeTab === "pcr-intraday" && "PCR Intraday"}
                            {activeTab === "oi-analytics" && "OI Analytics"}
                            {activeTab === "option-data-indicator" && "Data Indicator"}
                            {activeTab === "fii-dii" && "FII/DII Flows"}
                            {activeTab === "max-pain" && "Max Pain"}
                          </div>
                          <div className="text-xs text-muted-foreground leading-tight truncate">
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

            <TabsList className="hidden sm:grid w-full grid-cols-6">
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

          <TabsContent value="option-chain">
            <OptionChain
              instrument={selectedInstrument}
              expiry={selectedExpiry}
              timeframe={selectedTimeframe}
              strikeRange={getStrikeRangeValue()}
              strikeMode={strikeMode}
            />
          </TabsContent>

          <TabsContent value="pcr-intraday">
            <PCRIntraday instrument={selectedInstrument} timeframe={selectedTimeframe} />
          </TabsContent>

          <TabsContent value="oi-analytics">
            <OIAnalytics
              instrument={selectedInstrument}
              expiry={selectedExpiry}
              timeframe={selectedTimeframe}
              strikeRange={getStrikeRangeValue()}
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
