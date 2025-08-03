// WebSocket manager for real-time orderbook data with proxy server integration
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

// Get proxy URL from environment variable
const getProxyUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_PROXY_URL || 'ws://localhost:8080';
  // Convert to WSS for production
  return process.env.NODE_ENV === 'production' 
    ? baseUrl.replace('ws://', 'wss://').replace('http://', 'https://') 
    : baseUrl;
};

// WebSocket configurations using proxy server for OKX, Bybit, and Deribit
export const WEBSOCKET_CONFIGS: { [key: string]: WebSocketConfig } = {
  // OKX via proxy server
  okx: {
    url: `${getProxyUrl()}/okx`,
    subscriptionMessage: {
      op: 'subscribe',
      args: [{
        channel: 'books',
        instId: 'BTC-USDT'
      }]
    },
    name: 'OKX',
    parseMessage: (data: unknown): OrderbookData | null => {
      const parsed = data as { data?: Array<{ bids?: string[][]; asks?: string[][] }> };
      if (parsed.data && parsed.data[0]) {
        const orderbook = parsed.data[0];
        if (orderbook.bids && orderbook.asks) {
          return {
            bids: orderbook.bids.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)]),
            asks: orderbook.asks.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)])
          };
        }
      }
      return null;
    }
  },

  // Bybit via proxy server
  bybit: {
    url: `${getProxyUrl()}/bybit`,
    subscriptionMessage: {
      op: 'subscribe',
      args: ['orderbook.1.BTCUSDT']
    },
    name: 'Bybit',
    parseMessage: (data: unknown): OrderbookData | null => {
      const parsed = data as { data?: { b?: string[][]; a?: string[][] } };
      if (parsed.data && parsed.data.b && parsed.data.a) {
        return {
          bids: parsed.data.b.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)]),
          asks: parsed.data.a.slice(0, 15).map(([price, qty]) => [Number(price), Number(qty)])
        };
      }
      return null;
    }
  },

  // Deribit via proxy server
  deribit: {
    url: `${getProxyUrl()}/deribit`,
    subscriptionMessage: {
      jsonrpc: '2.0',
      id: 1,
      method: 'public/subscribe',
      params: {
        channels: ['book.BTC-PERPETUAL.100ms']
      }
    },
    name: 'Deribit',
    parseMessage: (data: unknown): OrderbookData | null => {
      const parsed = data as { params?: { data?: { bids?: number[][]; asks?: number[][] } } };
      if (parsed.params?.data) {
        const orderbook = parsed.params.data;
        if (orderbook.bids && orderbook.asks) {
          return {
            bids: orderbook.bids.slice(0, 15).map(([price, qty]) => [price, qty]),
            asks: orderbook.asks.slice(0, 15).map(([price, qty]) => [price, qty])
          };
        }
      }
      return null;
    }
  },
  
  // Binance US - CORS friendly (fallback)
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
