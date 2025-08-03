// Pure frontend WebSocket manager with CORS-compliant endpoints
interface OrderbookData {
  bids: Array<[number, number]>;
  asks: Array<[number, number]>;
}

export interface WebSocketConfig {
  url: string;
  subscriptionMessage: Record<string, unknown> | null;
  parseMessage: (data: unknown) => OrderbookData | null;
  name: string;
}

// CORS-compliant WebSocket endpoints (these don't have CORS restrictions)
export const WEBSOCKET_CONFIGS: { [key: string]: WebSocketConfig } = {
  // Binance US - CORS friendly
  binance: {
    url: 'wss://stream.binance.us:9443/ws/btcusdt@depth20@100ms',
    subscriptionMessage: null, // Auto-subscribes via URL
    name: 'Binance US',
    parseMessage: (data: unknown): OrderbookData | null => {
      const parsed = data as { bids?: string[][]; asks?: string[][] };
      if (parsed.bids && parsed.asks) {
        return {
          bids: parsed.bids.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)]),
          asks: parsed.asks.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)])
        };
      }
      return null;
    }
  },
  
  // Coinbase Pro - CORS friendly  
  coinbase: {
    url: 'wss://ws-feed.pro.coinbase.com',
    name: 'Coinbase Pro',
    subscriptionMessage: {
      type: 'subscribe',
      product_ids: ['BTC-USD'],
      channels: ['level2']
    },
    parseMessage: (data: unknown): OrderbookData | null => {
      const parsed = data as { type?: string; bids?: string[][]; asks?: string[][] };
      if (parsed.type === 'snapshot' && parsed.bids && parsed.asks) {
        return {
          bids: parsed.bids.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)]),
          asks: parsed.asks.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)])
        };
      }
      return null;
    }
  },

  // Kraken - CORS friendly
  kraken: {
    url: 'wss://ws.kraken.com',
    name: 'Kraken',
    subscriptionMessage: {
      event: 'subscribe',
      pair: ['XBT/USD'],
      subscription: { name: 'book', depth: 25 }
    },
    parseMessage: (data: unknown): OrderbookData | null => {
      const parsed = data as unknown[];
      if (Array.isArray(parsed) && parsed[1] && typeof parsed[1] === 'object') {
        const orderbook = parsed[1] as { bs?: string[][]; as?: string[][] };
        if (orderbook.bs && orderbook.as) {
          return {
            bids: orderbook.bs.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)]),
            asks: orderbook.as.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)])
          };
        }
      }
      return null;
    }
  },

  // Bitfinex - CORS friendly
  bitfinex: {
    url: 'wss://api-pub.bitfinex.com/ws/2',
    name: 'Bitfinex',
    subscriptionMessage: {
      event: 'subscribe',
      channel: 'book',
      symbol: 'BTCUSD',
      prec: 'P0',
      freq: 'F0',
      len: '25'
    },
    parseMessage: (data: unknown): OrderbookData | null => {
      const parsed = data as unknown[];
      if (Array.isArray(parsed) && parsed[1] && Array.isArray(parsed[1]) && Array.isArray(parsed[1][0])) {
        const orderbook = parsed[1] as number[][];
        const bids: Array<[number, number]> = [];
        const asks: Array<[number, number]> = [];
        
        orderbook.forEach((entry: number[]) => {
          if (entry.length >= 3) {
            const [price, , amount] = entry;
            if (amount > 0) {
              bids.push([price, amount]);
            } else {
              asks.push([price, Math.abs(amount)]);
            }
          }
        });
        
        return {
          bids: bids.slice(0, 15),
          asks: asks.slice(0, 15)
        };
      }
      return null;
    }
  },

  // Demo mode with realistic mock data
  demo: {
    url: 'demo://localhost',
    name: 'Demo Mode',
    subscriptionMessage: null,
    parseMessage: () => null // Handled separately
  }
};

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private onMessage: (data: OrderbookData) => void;
  private onConnectionChange: (connected: boolean, error?: string) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private demoInterval: NodeJS.Timeout | null = null;

  constructor(
    exchange: string,
    onMessage: (data: OrderbookData) => void,
    onConnectionChange: (connected: boolean, error?: string) => void
  ) {
    this.config = WEBSOCKET_CONFIGS[exchange] || WEBSOCKET_CONFIGS.demo;
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange;
  }

  connect(): void {
    if (this.config.url === 'demo://localhost') {
      this.startDemoMode();
      return;
    }

    try {
      this.ws = new WebSocket(this.config.url);
      
      this.ws.onopen = () => {
        console.log(`Connected to ${this.config.name}`);
        this.reconnectAttempts = 0;
        this.onConnectionChange(true);
        
        // Send subscription message if needed
        if (this.config.subscriptionMessage && this.ws) {
          this.ws.send(JSON.stringify(this.config.subscriptionMessage));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const orderbook = this.config.parseMessage(data);
          if (orderbook && orderbook.bids.length > 0 && orderbook.asks.length > 0) {
            this.onMessage(orderbook);
          }
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error(`WebSocket error for ${this.config.name}:`, error);
        this.onConnectionChange(false, 'Connection error');
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket closed for ${this.config.name}:`, event.code, event.reason);
        this.onConnectionChange(false, event.reason || 'Connection closed');
        
        // Auto-reconnect with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 5000);
          this.reconnectAttempts++;
          
          this.reconnectTimeout = setTimeout(() => {
            console.log(`Reconnecting to ${this.config.name} (attempt ${this.reconnectAttempts})...`);
            this.connect();
          }, delay);
        } else {
          console.log(`Max reconnection attempts reached for ${this.config.name}, switching to demo mode`);
          this.startDemoMode();
        }
      };

    } catch (error) {
      console.error(`Failed to create WebSocket connection for ${this.config.name}:`, error);
      this.onConnectionChange(false, 'Failed to connect');
      this.startDemoMode();
    }
  }

  private startDemoMode(): void {
    console.log('Starting demo mode with realistic market data');
    this.onConnectionChange(true, 'Demo mode active');
    
    // Generate realistic demo data every 100ms
    const generateDemoData = () => {
      const basePrice = 65000 + (Math.random() - 0.5) * 1000; // BTC price with some variation
      const bids: Array<[number, number]> = [];
      const asks: Array<[number, number]> = [];
      
      // Generate realistic orderbook with spread
      const spread = basePrice * 0.0001; // 0.01% spread
      
      for (let i = 0; i < 15; i++) {
        const bidPrice = basePrice - spread - (i * basePrice * 0.00005);
        const askPrice = basePrice + spread + (i * basePrice * 0.00005);
        
        // Realistic quantities with depth decay
        const baseLiquidity = Math.random() * 5 + 1;
        const depthFactor = Math.exp(-i * 0.1);
        
        bids.push([
          Math.round(bidPrice * 100) / 100,
          Math.round(baseLiquidity * depthFactor * 10000) / 10000
        ]);
        
        asks.push([
          Math.round(askPrice * 100) / 100,
          Math.round(baseLiquidity * depthFactor * 10000) / 10000
        ]);
      }
      
      this.onMessage({ bids, asks });
    };

    // Start demo data generation
    generateDemoData(); // Initial data
    const demoInterval = setInterval(generateDemoData, 100 + Math.random() * 400); // 100-500ms intervals
    
    // Store interval for cleanup
    this.demoInterval = demoInterval;
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    
    this.ws = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || this.demoInterval != null;
  }
}
