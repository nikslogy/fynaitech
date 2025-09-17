// API service layer for FynAI market data
const BASE_URL = '/api';

export interface MarketIndex {
  symbol_name: string;
  open: number;
  high: number;
  low: number;
  close: number;
  last_trade_price: number;
  created_at: string;
  volume: number;
  high52: number;
  low52: number;
  change_value: number;
  change_per: number;
  max_pain: number;
  lot_size: number;
}

export interface PCRData {
  time: string;
  created_at: string;
  expiry_date: string;
  pcr: number;
  volume_pcr: number;
  change_oi_pcr: number;
  index_close: number;
}

export interface PCRResponse {
  result: number;
  resultMessage: string;
  resultData: {
    oiExpiryDates: string[];
    oiDatas: PCRData[];
  };
}

export interface MarketResponse {
  result: number;
  resultMessage: string;
  resultData: MarketIndex[];
}

export interface SpotDataResponse {
  result: number;
  resultMessage: string;
  resultData: MarketIndex;
}

export interface MaxPainIntradayData {
  symbol_name: string;
  expiry_date: string;
  spot_price: string;
  max_pain_level: string;
  created_at: string;
}

export interface MaxPainIntradayResponse {
  result: number;
  resultMessage: string;
  resultData: MaxPainIntradayData[];
}

export interface TrendingOIData {
  sr_no: number;
  time: string;
  index_close: number;
  calls_volume: number;
  calls_change_oi: number;
  puts_volume: number;
  puts_change_oi: number;
  diff_in_oi: number;
  change_in_direction: number;
  pcr: number;
  change_in_oi_pcr: number;
  volume_pcr: number;
  calls_change_in_direction: number;
  puts_change_in_direction: number;
  sentiment: string;
}

export interface TrendingOIResponse {
  result: number;
  resultMessage: string;
  resultData: TrendingOIData[];
}

export interface OITimeRangeData {
  symbol_name: string;
  expiry_date: string;
  strike_price: number;
  time: string;
  index_close: number;
  calls_change_oi: number;
  calls_change_oi_value: number;
  puts_change_oi: number;
  puts_change_oi_value: number;
}

export interface OITimeRangeResponse {
  result: number;
  resultMessage: string;
  resultData: OITimeRangeData[];
}

// Fetch stock index data (NIFTY, BANK NIFTY, etc.)
export async function fetchStockIndexData(): Promise<MarketIndex[]> {
  try {
    const response = await fetch(`${BASE_URL}/stock-index-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control to ensure fresh data
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MarketResponse = await response.json();
    
    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch market data');
    }

    return data.resultData;
  } catch (error) {
    console.error('Error fetching stock index data:', error);
    // Return fallback data structure to prevent UI crashes
    return [];
  }
}

// Fetch today's spot data for a specific symbol
export async function fetchTodaySpotData(symbol: string, createdAt?: string): Promise<MarketIndex | null> {
  try {
    const params = new URLSearchParams({
      symbol: symbol.toLowerCase(),
      ...(createdAt && { created_at: createdAt })
    });

    const response = await fetch(`${BASE_URL}/today-spot-data?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SpotDataResponse = await response.json();
    
    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch spot data');
    }

    return data.resultData;
  } catch (error) {
    console.error('Error fetching spot data:', error);
    return null;
  }
}

// Fetch PCR intraday data
export async function fetchPCRData(symbolName: string = 'nifty', reqDate?: string): Promise<PCRData[]> {
  try {
    const params = new URLSearchParams({
      symbolName: symbolName.toLowerCase(),
      reqType: 'nse_pcr_data',
      ...(reqDate && { reqDate })
    });

    const response = await fetch(`${BASE_URL}/oi-pcr-data?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PCRResponse = await response.json();
    
    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch PCR data');
    }

    return data.resultData.oiDatas;
  } catch (error) {
    console.error('Error fetching PCR data:', error);
    return [];
  }
}

// Helper function to get symbol name for API calls
export function getSymbolForAPI(instrument: string): string {
  switch (instrument.toUpperCase()) {
    case 'NIFTY':
      return 'nifty';
    case 'BANKNIFTY':
      return 'banknifty';
    default:
      return instrument.toLowerCase();
  }
}

// Helper function to format numbers for display
export function formatNumber(num: number | undefined | null, decimals: number = 2): string {
  // Only return N/A for truly invalid values
  if (num === undefined || num === null || (typeof num === 'number' && isNaN(num))) {
    return "N/A";
  }

  // Convert to number if it's a string
  const numericValue = typeof num === 'string' ? parseFloat(num) : num;

  // Check if the conversion resulted in NaN
  if (isNaN(numericValue)) {
    return "N/A";
  }

  return numericValue.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Helper function to get trend from change value
export function getTrend(changeValue: number): 'up' | 'down' | 'neutral' {
  if (changeValue > 0) return 'up';
  if (changeValue < 0) return 'down';
  return 'neutral';
}

// Fetch max pain intraday chart data
export async function fetchMaxPainIntradayChart(symbol: string = 'nifty', exchange: string = 'nse'): Promise<MaxPainIntradayData[]> {
  try {
    const params = new URLSearchParams({
      symbol: symbol.toLowerCase(),
      exchange: exchange.toLowerCase()
    });

    const response = await fetch(`${BASE_URL}/max-pain-intraday-chart?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MaxPainIntradayResponse = await response.json();
    
    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch max pain intraday chart data');
    }

    return data.resultData;
  } catch (error) {
    console.error('Error fetching max pain intraday chart data:', error);
    return [];
  }
}

// Fetch trending OI data
export async function fetchTrendingOIData(
  symbol: string = 'nifty', 
  strikePrice: string = '24650,24700,24750,24800,24850,24900',
  expiryDate: string = '2025-09-16T00:00:00',
  interval: string = '3',
  createdAt: string = ''
): Promise<TrendingOIData[]> {
  try {
    const params = new URLSearchParams({
      symbol: symbol.toLowerCase(),
      strike_price: strikePrice,
      expiry_date: expiryDate,
      interval,
      created_at: createdAt // Always include created_at, even if empty
    });

    const response = await fetch(`${BASE_URL}/trending-oi-data?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TrendingOIResponse = await response.json();
    
    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch trending OI data');
    }

    return data.resultData;
  } catch (error) {
    console.error('Error fetching trending OI data:', error);
    return [];
  }
}

// Fetch OI time range data
export async function fetchOITimeRangeData(
  symbol: string = 'nifty',
  startTime: string = '09:10:00',
  endTime: string = '15:30:00',
  expiry: string = ''
): Promise<OITimeRangeData[]> {
  try {
    const params = new URLSearchParams({
      symbol: symbol.toLowerCase(),
      start_time: startTime,
      end_time: endTime,
      expiry: expiry // Always include expiry, even if empty
    });

    const response = await fetch(`${BASE_URL}/oi-time-range?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OITimeRangeResponse = await response.json();

    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch OI time range data');
    }

    return data.resultData;
  } catch (error) {
    console.error('Error fetching OI time range data:', error);
    return [];
  }
}

// Fetch future expiry data
export async function fetchFutureExpiryData(symbol: string = 'nifty'): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      symbol: symbol.toLowerCase()
    });

    const response = await fetch(`${BASE_URL}/future-expiry-data?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch future expiry data');
    }

    return data.resultData;
  } catch (error) {
    console.error('Error fetching future expiry data:', error);
    return [];
  }
}

// Helper function to generate strike prices based on current price and range
export function generateStrikePrices(currentPrice: number, range: string): string {
  const atmPrice = Math.round(currentPrice / 50) * 50; // Round to nearest 50
  
  if (range === 'ALL') {
    // Generate a wide range of strikes
    const strikes = [];
    for (let i = atmPrice - 1000; i <= atmPrice + 1000; i += 50) {
      strikes.push(i);
    }
    return strikes.join(',');
  }
  
  // Parse ATM± range
  const match = range.match(/ATM±(\d+)/);
  if (match) {
    const rangeValue = parseInt(match[1]);
    const strikes = [];
    for (let i = atmPrice - (rangeValue * 50); i <= atmPrice + (rangeValue * 50); i += 50) {
      strikes.push(i);
    }
    return strikes.join(',');
  }
  
  // Default range
  return `${atmPrice-500},${atmPrice-450},${atmPrice-400},${atmPrice-350},${atmPrice-300},${atmPrice-250},${atmPrice-200},${atmPrice-150},${atmPrice-100},${atmPrice-50},${atmPrice},${atmPrice+50},${atmPrice+100},${atmPrice+150},${atmPrice+200},${atmPrice+250},${atmPrice+300},${atmPrice+350},${atmPrice+400},${atmPrice+450},${atmPrice+500}`;
}

export interface OptionChainData {
  symbol_name: string;
  expiry_date: string;
  strike_price: number;
  call_inst_type?: string;
  calls_change_oi: number;
  calls_net_change: number;
  calls_iv: number;
  calls_ltp: number;
  calls_oi: number;
  calls_oi_value: number;
  calls_change_oi_value: number;
  calls_ltp_per: number;
  calls_high: number;
  calls_low: number;
  calls_bid_price: number;
  calls_bid_quantity: number;
  calls_offer_price: number;
  calls_offer_quantity: number;
  calls_average_price: number;
  calls_intrisic: number;
  calls_time_value: number;
  index_close: number;
  put_inst_type?: string;
  puts_change_oi: number;
  puts_net_change: number;
  puts_iv: number;
  puts_ltp: number;
  puts_oi: number;
  puts_oi_value: number;
  puts_change_oi_value: number;
  puts_ltp_per: number;
  puts_high: number;
  puts_low: number;
  puts_bid_price: number;
  puts_bid_quantity: number;
  puts_offer_price: number;
  puts_offer_quantity: number;
  puts_average_price: number;
  puts_intrisic: number;
  puts_time_value: number;
  created_at: string;
  time: string;
  calls_volume: number;
  puts_volume: number;
  pcr: number;
  call_delta: number;
  call_gamma: number;
  call_vega: number;
  call_theta: number;
  call_rho: number;
  calls_builtup: string;
  put_delta: number;
  put_gamma: number;
  put_vega: number;
  put_theta: number;
  put_rho: number;
  puts_builtup: string;
}

export interface OptionChainCalculatorResponse {
  result: number;
  resultMessage: string;
  resultData: {
    opExpiryDates: string[];
    opDatas: OptionChainData[];
  };
}

export interface OptionChainDataResponse {
  result: number;
  resultMessage: string;
  resultData: {
    opDatas: OptionChainData[];
  };
}

// Fetch option chain calculator data
export async function fetchOptionChainCalculatorData(
  symbol: string = 'nifty',
  expiryDate?: string,
  createdTime: string = '09:20:00',
  atmBelow: string = '20',
  atmAbove: string = '20'
): Promise<OptionChainData[]> {
  try {
    const params = new URLSearchParams({
      symbol: symbol.toLowerCase(),
      ...(expiryDate && { expiryDate }),
      createdTime,
      atmBelow,
      atmAbove
    });

    const response = await fetch(`${BASE_URL}/option-chain-calculator-data?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OptionChainCalculatorResponse = await response.json();

    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch option chain calculator data');
    }

    return data.resultData.opDatas;
  } catch (error) {
    console.error('Error fetching option chain calculator data:', error);
    return [];
  }
}

// Fetch option chain data
export async function fetchOptionChainData(
  symbol: string = 'nifty',
  exchange: string = 'nse',
  expiryDate?: string,
  atmBelow: string = '0',
  atmAbove: string = '0'
): Promise<OptionChainData[]> {
  try {
    const params = new URLSearchParams({
      symbol: symbol.toLowerCase(),
      exchange: exchange.toLowerCase(),
      ...(expiryDate && { expiryDate }),
      atmBelow,
      atmAbove
    });

    const response = await fetch(`${BASE_URL}/option-chain-data?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OptionChainDataResponse = await response.json();

    if (data.result !== 1) {
      throw new Error(data.resultMessage || 'Failed to fetch option chain data');
    }

    return data.resultData.opDatas;
  } catch (error) {
    console.error('Error fetching option chain data:', error);
    return [];
  }
}

// Helper function to get strength indicator
export function getStrength(changePercent: number): 'Bullish' | 'Bearish' | 'Neutral' {
  if (changePercent > 0.5) return 'Bullish';
  if (changePercent < -0.5) return 'Bearish';
  return 'Neutral';
}
