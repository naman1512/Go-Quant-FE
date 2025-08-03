export interface ExchangeApi {
  rest: string;
  ws: string;
  name: string;
  features: string[];
}

export interface SymbolMapping {
  [venue: string]: string;
}

// Get proxy URL from environment variable
const getProxyUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_PROXY_URL || 'ws://localhost:8080';
  // Convert to WSS for production
  return process.env.NODE_ENV === 'production' 
    ? baseUrl.replace('ws://', 'wss://').replace('http://', 'https://') 
    : baseUrl;
};

export const EXCHANGE_APIS: { [key: string]: ExchangeApi } = {
  okx: {
    rest: 'https://www.okx.com/api/v5/market/books',
    ws: `${getProxyUrl()}/okx`,
    name: 'OKX',
    features: ['WebSocket', 'Real-time', 'High Frequency']
  },
  bybit: {
    rest: 'https://api.bybit.com/v5/market/orderbook',
    ws: `${getProxyUrl()}/bybit`,
    name: 'Bybit',
    features: ['WebSocket', 'Derivatives', 'Real-time']
  },
  deribit: {
    rest: 'https://www.deribit.com/api/v2/public/get_order_book',
    ws: `${getProxyUrl()}/deribit`,
    name: 'Deribit',
    features: ['Options', 'Futures', 'Professional']
  },
};

export const SYMBOL_MAPPINGS: { [symbol: string]: SymbolMapping } = {
  'BTC-USD': {
    okx: 'BTC-USDT',
    bybit: 'BTCUSDT',
    deribit: 'BTC-PERPETUAL'
  },
  'ETH-USD': {
    okx: 'ETH-USDT',
    bybit: 'ETHUSDT',
    deribit: 'ETH-PERPETUAL'
  },
  'SOL-USD': {
    okx: 'SOL-USDT',
    bybit: 'SOLUSDT',
    deribit: 'SOL-PERPETUAL'
  }
};

export const VENUES = [
  { label: 'Demo Mode', value: 'demo', description: 'Realistic simulation for testing' },
  { label: 'Binance US', value: 'binance', description: 'Global crypto exchange (direct connection)' },
  { label: 'OKX', value: 'okx', description: 'Global crypto exchange with advanced trading features' },
  { label: 'Bybit', value: 'bybit', description: 'Professional derivatives trading platform' },
  { label: 'Deribit', value: 'deribit', description: 'Premier options and futures exchange' },
];

export function getExchangeSymbol(baseSymbol: string, venue: string): string {
  return SYMBOL_MAPPINGS[baseSymbol]?.[venue] || baseSymbol;
}

export function formatSymbolForDisplay(symbol: string): string {
  return symbol.replace('-PERPETUAL', ' PERP').replace('USDT', '/USDT').replace('-', '/');
}
