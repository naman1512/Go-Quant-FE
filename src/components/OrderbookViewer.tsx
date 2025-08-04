import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { VENUES, formatSymbolForDisplay } from "@/lib/exchanges";
import { calculateOrderMetrics, calculateOrderbookImbalance, getSpreadInfo, formatCurrency, formatPercentage, formatQuantity, type OrderbookLevel } from "@/lib/marketCalculations";
import { WebSocketManager } from "@/lib/webSocketManager";
import DepthChart from "./DepthChart";

export interface OrderbookViewerProps {
  venue: string;
  symbol: string;
  simulatedOrder?: {
    venue: string;
    symbol: string;
    orderType: string;
    side: string;
    price?: string;
    quantity: string;
    timing: number;
  } | null;
}

interface WebSocketState {
  connected: boolean;
  reconnectAttempts: number;
  lastMessageTime: number;
  connectionError: string | null;
  usingDemo: boolean;
}

const OrderbookViewer = ({ venue, symbol, simulatedOrder }: OrderbookViewerProps) => {
  const [orderbook, setOrderbook] = useState<{ bids: OrderbookLevel[]; asks: OrderbookLevel[] }>({ 
    bids: [], 
    asks: [] 
  });
  const [wsState, setWsState] = useState<WebSocketState>({
    connected: false,
    reconnectAttempts: 0,
    lastMessageTime: 0,
    connectionError: null,
    usingDemo: false
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  const handleMessage = useCallback((data: { bids: Array<[number, number]>; asks: Array<[number, number]> }) => {
    const newOrderbook = {
      bids: data.bids.map(([price, quantity]) => ({ price, quantity })),
      asks: data.asks.map(([price, quantity]) => ({ price, quantity }))
    };
    setOrderbook(newOrderbook);
    setLastUpdate(new Date());
    setWsState(prev => ({ ...prev, lastMessageTime: Date.now() }));
  }, []);

  const handleConnectionChange = useCallback((connected: boolean, error?: string) => {
    setWsState(prev => ({ 
      ...prev, 
      connected,
      connectionError: error || null,
      usingDemo: venue === 'demo' || (!connected && Boolean(error?.includes('demo')))
    }));
  }, [venue]);

  const connectWebSocket = useCallback(() => {
    if (!venue || !symbol) return;

    // Clean up existing connection
    if (wsManagerRef.current) {
      wsManagerRef.current.disconnect();
    }

    console.log(`Connecting to ${venue} for ${symbol}...`);
    
    // Create new WebSocket manager
    wsManagerRef.current = new WebSocketManager(
      venue,
      handleMessage,
      handleConnectionChange
    );

    // Connect
    wsManagerRef.current.connect();
  }, [venue, symbol, handleMessage, handleConnectionChange]);

  // Manual reconnect function
  const manualReconnect = useCallback(() => {
    setWsState(prev => ({ 
      ...prev, 
      reconnectAttempts: 0, 
      connectionError: null 
    }));
    connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [connectWebSocket]);

  // Calculate metrics and analysis
  const spreadInfo = getSpreadInfo(orderbook);
  const imbalance = calculateOrderbookImbalance(orderbook);
  
  // Memoize order metrics to prevent recalculation on every render
  const orderMetrics = useMemo(() => {
    if (simulatedOrder && simulatedOrder.quantity) {
      return calculateOrderMetrics(orderbook, simulatedOrder);
    }
    return null;
  }, [orderbook, simulatedOrder]);

  // Memoize highlighted price levels to prevent flickering
  const highlightedPrices = useMemo(() => {
    if (!simulatedOrder || !simulatedOrder.price) return { buy: null, sell: null };
    
    const price = Number(simulatedOrder.price);
    return {
      buy: simulatedOrder.side === "buy" ? price : null,
      sell: simulatedOrder.side === "sell" ? price : null
    };
  }, [simulatedOrder]);

  // Memoize connection status to prevent flickering
  const connectionStatus = useMemo(() => (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          wsState.connected ? 'bg-green-400' : 
          wsState.usingDemo ? 'bg-yellow-400' : 'bg-red-400'
        }`}></div>
        <span className="text-white/60">
          {wsState.connected ? 'Live Data' : 
           wsState.usingDemo ? 'Demo Mode' :
           wsState.reconnectAttempts > 0 ? `Reconnecting... (${wsState.reconnectAttempts}/3)` : 'Connecting...'}
        </span>
        {lastUpdate && (
          <span className="text-white/40">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
        {!wsState.connected && wsState.reconnectAttempts >= 3 && (
          <button
            onClick={manualReconnect}
            className="ml-2 px-2 py-1 bg-blue-500/20 border border-blue-400/50 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition"
          >
            Retry Live Data
          </button>
        )}
      </div>
      {wsState.connectionError && !wsState.connected && !wsState.usingDemo && (
        <div className="text-red-400 text-xs">
          {wsState.connectionError}
        </div>
      )}
      {wsState.usingDemo && (
        <div className="text-yellow-400 text-xs">
          Live data unavailable. Showing realistic demo data for evaluation.
        </div>
      )}
    </div>
  ), [wsState, lastUpdate, manualReconnect]);

  if (orderbook.bids.length === 0 && orderbook.asks.length === 0) {
    return (
      <div className="orderbook-viewer p-3 sm:p-4 bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h2 className="font-bold text-white text-lg sm:text-xl">
            Orderbook
            <span className="text-white/70 text-sm sm:text-base ml-2 block sm:inline">
              ({VENUES.find(v => v.value === venue)?.label} - {formatSymbolForDisplay(symbol)})
            </span>
          </h2>
          {connectionStatus}
        </div>
        <div className="py-8 sm:py-12 text-center">
          <div className="animate-pulse">
            {!wsState.connectionError ? (
              <>
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/80 font-medium text-sm sm:text-base">Connecting to {VENUES.find(v => v.value === venue)?.label}...</p>
                <p className="text-white/60 text-xs sm:text-sm mt-2">Establishing real-time WebSocket connection</p>
                {wsState.reconnectAttempts > 0 && (
                  <p className="text-yellow-400 text-xs mt-2">
                    Reconnection attempt #{wsState.reconnectAttempts}/3
                  </p>
                )}
                <div className="mt-4 text-white/40 text-xs">
                  <p>Live orderbook data incoming...</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-400 text-lg">⚠️</span>
                </div>
                <p className="text-red-400 font-medium mb-2 text-sm sm:text-base">Connection Failed</p>
                <p className="text-white/60 text-xs sm:text-sm">Unable to connect to {VENUES.find(v => v.value === venue)?.label}</p>
                <div className="mt-4 p-3 bg-red-500/10 border border-red-400/30 rounded-lg text-sm">
                  <p className="text-red-300 mb-2">Error Details:</p>
                  <p className="text-white/70 text-xs sm:text-sm break-words">{wsState.connectionError}</p>
                </div>
                {wsState.reconnectAttempts >= 3 && (
                  <button
                    onClick={manualReconnect}
                    className="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-400/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition text-sm"
                  >
                    Try Again
                  </button>
                )}
                <div className="mt-4 text-white/40 text-xs space-y-1">
                  <p>• Check your internet connection</p>
                  <p>• The exchange may be experiencing issues</p>
                  <p>• Try switching to a different exchange</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orderbook-viewer p-3 sm:p-4 bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="font-bold text-white text-lg sm:text-xl">
          Orderbook
          <span className="text-white/70 text-sm sm:text-base ml-2 block sm:inline">
            ({VENUES.find(v => v.value === venue)?.label} - {formatSymbolForDisplay(symbol)})
          </span>
        </h2>
        {connectionStatus}
      </div>

      {/* Demo Mode Notification */}
      {wsState.usingDemo && (
        <div className="text-center mb-4 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium">📊 Demo Mode Active</p>
          <p className="text-white/60 text-xs">Live exchange data unavailable. Showing realistic simulation for demonstration purposes.</p>
        </div>
      )}

      {/* Market Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm">
        <div className="bg-black/30 rounded-lg p-2 sm:p-3 border border-white/10">
          <div className="text-white/60 text-xs">Spread</div>
          <div className="text-white font-mono text-sm sm:text-lg">
            {formatCurrency(spreadInfo.spread)}
          </div>
          <div className="text-white/40 text-xs">
            {formatPercentage(spreadInfo.spreadPercentage)}
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-2 sm:p-3 border border-white/10">
          <div className="text-white/60 text-xs">Mid Price</div>
          <div className="text-white font-mono text-sm sm:text-lg">
            {formatCurrency(spreadInfo.midPrice)}
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-2 sm:p-3 border border-white/10">
          <div className="text-white/60 text-xs">Imbalance</div>
          <div className={`font-mono text-sm sm:text-lg ${
            imbalance.interpretation === 'bullish' ? 'text-green-400' :
            imbalance.interpretation === 'bearish' ? 'text-red-400' : 'text-white'
          }`}>
            {formatPercentage(imbalance.ratio * 100)}
          </div>
          <div className="text-white/40 text-xs capitalize">
            {imbalance.strength} {imbalance.interpretation}
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-2 sm:p-3 border border-white/10">
          <div className="text-white/60 text-xs">Total Volume</div>
          <div className="text-white font-mono text-sm sm:text-lg">
            {formatQuantity(
              orderbook.bids.slice(0, 10).reduce((sum: number, level: OrderbookLevel) => sum + level.quantity, 0) +
              orderbook.asks.slice(0, 10).reduce((sum: number, level: OrderbookLevel) => sum + level.quantity, 0)
            )}
          </div>
        </div>
      </div>

      {/* Orderbook Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div>
          <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-400 rounded"></span>
            Bids
          </h3>
          <div className="h-64 sm:h-80 lg:h-96 overflow-y-auto bg-black/20 rounded-lg border border-white/10">
            <div className="sticky top-0 bg-black/40 backdrop-blur-sm z-10">
              <div className="grid grid-cols-3 gap-2 text-xs text-white/60 p-2 border-b border-white/20">
                <div>Price</div>
                <div>Quantity</div>
                <div className="hidden sm:block">Total</div>
                <div className="sm:hidden">Qty</div>
              </div>
            </div>
            <div className="space-y-1 p-2">
              {orderbook.bids.map((level: OrderbookLevel) => {
                const isHighlighted = highlightedPrices.buy === level.price;
                
                return (
                  <div 
                    key={`bid-${level.price}`}
                    className={`grid grid-cols-3 gap-2 text-xs sm:text-sm py-1 px-2 rounded transition-colors ${
                      isHighlighted 
                        ? "bg-yellow-400/20 border-l-4 border-yellow-400" 
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="text-green-400 font-mono">{formatCurrency(level.price)}</div>
                    <div className="text-white font-mono">{formatQuantity(level.quantity)}</div>
                    <div className="text-white/70 font-mono">{formatCurrency(level.price * level.quantity)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-400 rounded"></span>
            Asks
          </h3>
          <div className="h-64 sm:h-80 lg:h-96 overflow-y-auto bg-black/20 rounded-lg border border-white/10">
            <div className="sticky top-0 bg-black/40 backdrop-blur-sm z-10">
              <div className="grid grid-cols-3 gap-2 text-xs text-white/60 p-2 border-b border-white/20">
                <div>Price</div>
                <div>Quantity</div>
                <div className="hidden sm:block">Total</div>
                <div className="sm:hidden">Qty</div>
              </div>
            </div>
            <div className="space-y-1 p-2">
              {orderbook.asks.map((level: OrderbookLevel) => {
                const isHighlighted = highlightedPrices.sell === level.price;
                
                return (
                  <div 
                    key={`ask-${level.price}`}
                    className={`grid grid-cols-3 gap-2 text-xs sm:text-sm py-1 px-2 rounded transition-colors ${
                      isHighlighted 
                        ? "bg-yellow-400/20 border-l-4 border-yellow-400" 
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="text-red-400 font-mono">{formatCurrency(level.price)}</div>
                    <div className="text-white font-mono">{formatQuantity(level.quantity)}</div>
                    <div className="text-white/70 font-mono">{formatCurrency(level.price * level.quantity)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Market Depth Chart */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-white/80 font-semibold mb-3">Market Depth Visualization</h3>
        <div className="overflow-x-auto">
          <DepthChart 
            bids={orderbook.bids} 
            asks={orderbook.asks} 
            width={800} 
            height={200}
            simulatedOrder={simulatedOrder}
          />
        </div>
      </div>

      {/* Order Impact Metrics */}
      {orderMetrics && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/20 rounded-xl p-4 sm:p-6">
          <h3 className="font-bold mb-4 text-lg sm:text-xl text-white flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-400 rounded"></span>
            Order Impact Analysis
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4">
            <div className="text-center">
              <div className="text-white/60 text-xs sm:text-sm mb-1">Fill Percentage</div>
              <div className={`font-mono text-lg sm:text-2xl font-bold ${
                orderMetrics.fillPercentage >= 100 ? 'text-green-400' : 
                orderMetrics.fillPercentage >= 80 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {formatPercentage(orderMetrics.fillPercentage)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-xs sm:text-sm mb-1">Market Impact</div>
              <div className={`font-mono text-lg sm:text-2xl font-bold ${
                orderMetrics.marketImpact < 0.01 ? 'text-green-400' : 
                orderMetrics.marketImpact < 0.1 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {formatCurrency(orderMetrics.marketImpact)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-xs sm:text-sm mb-1">Slippage</div>
              <div className={`font-mono text-lg sm:text-2xl font-bold ${
                orderMetrics.slippage < 0.01 ? 'text-green-400' : 
                orderMetrics.slippage < 0.1 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {formatCurrency(orderMetrics.slippage)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-xs sm:text-sm mb-1">Est. Time to Fill</div>
              <div className="text-white font-mono text-lg sm:text-2xl font-bold">
                {orderMetrics.estimatedTimeToFill.toFixed(1)}s
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/60">Average Fill Price:</div>
              <div className="text-white font-mono text-base sm:text-lg">{formatCurrency(orderMetrics.averageFillPrice)}</div>
            </div>
            <div>
              <div className="text-white/60">Total Cost:</div>
              <div className="text-white font-mono text-base sm:text-lg">{formatCurrency(orderMetrics.totalCost)}</div>
            </div>
          </div>

          {/* Warnings */}
          {(orderMetrics.priceImpactWarning || orderMetrics.liquidityWarning) && (
            <div className="mt-4 space-y-2">
              {orderMetrics.liquidityWarning && (
                <div className="flex items-start gap-2 text-yellow-400 bg-yellow-400/10 rounded-lg p-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
                  <span className="font-semibold text-sm sm:text-base">Liquidity Warning: Order may not be fully filled at current market depth.</span>
                </div>
              )}
              {orderMetrics.priceImpactWarning && (
                <div className="flex items-start gap-2 text-red-400 bg-red-400/10 rounded-lg p-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">🚨</span>
                  <span className="font-semibold text-sm sm:text-base">High Impact Warning: This order may significantly affect market price.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(OrderbookViewer);