"use client";
import { useState, useEffect } from "react";
import OrderForm from "@/components/OrderForm";
import OrderbookViewer from "@/components/OrderbookViewer";
import { VENUES } from "@/lib/exchanges";
import { SYMBOLS } from "@/lib/orderFormOptions";

interface SimulatedOrder {
  venue: string;
  symbol: string;
  orderType: string;
  side: string;
  price?: string;
  quantity: string;
  timing: number;
}

export default function Home() {
  const [selectedVenue, setSelectedVenue] = useState(VENUES[0].value);
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]?.value || "BTC-USD");
  const [simulatedOrder, setSimulatedOrder] = useState<SimulatedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOrderSimulation = (order: SimulatedOrder) => {
    setSelectedVenue(order.venue);
    setSelectedSymbol(order.symbol);
    setSimulatedOrder(order);
  };

  const clearSimulation = () => {
    setSimulatedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">GoQuant Orderbook Simulator</h1>
          <p className="text-white/60">Initializing trading environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GoQuant
                </span>
                <span className="hidden sm:inline text-white/70 ml-2 text-sm sm:text-base">Orderbook Simulator</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 text-sm">
                <a href="#features" className="text-white/70 hover:text-white transition">Features</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Real-Time Orderbook
            </span>
            <br />
            <span className="text-white">Visualization & Simulation</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
            Experience professional-grade order simulation across multiple cryptocurrency exchanges. 
            Visualize market impact, analyze liquidity, and make informed trading decisions with real-time data from 
            <span className="font-semibold text-blue-400"> OKX</span>, 
            <span className="font-semibold text-green-400"> Bybit</span>, and 
            <span className="font-semibold text-purple-400"> Deribit</span>.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 max-w-2xl mx-auto px-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-white">3</div>
              <div className="text-white/60 text-xs sm:text-sm">Exchanges</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-white">15+</div>
              <div className="text-white/60 text-xs sm:text-sm">Order Levels</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-white">Real-time</div>
              <div className="text-white/60 text-xs sm:text-sm">WebSocket</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-white">Advanced</div>
              <div className="text-white/60 text-xs sm:text-sm">Analytics</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Form Section */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24">
              <OrderForm onSimulate={handleOrderSimulation} />
            </div>
          </div>

          {/* Orderbook Viewer Section */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="space-y-4 sm:space-y-6">
              {/* Current Simulation Status */}
              {simulatedOrder && (
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/30 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <h3 className="text-white font-semibold">Active Simulation</h3>
                      <p className="text-white/70 text-sm break-words">
                        {simulatedOrder.orderType.toUpperCase()} {simulatedOrder.side.toUpperCase()} 
                        {' '}{simulatedOrder.quantity} {selectedSymbol} on {VENUES.find(v => v.value === simulatedOrder.venue)?.label}
                        {simulatedOrder.price && ` at $${simulatedOrder.price}`}
                      </p>
                    </div>
                    <button
                      onClick={clearSimulation}
                      className="px-4 py-2 bg-red-500/20 border border-red-400/50 text-red-300 rounded-lg hover:bg-red-500/30 transition w-full sm:w-auto"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Venue Switcher */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Exchange Venue</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {VENUES.map((venue) => (
                    <button
                      key={venue.value}
                      onClick={() => setSelectedVenue(venue.value)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedVenue === venue.value
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold text-sm sm:text-base">{venue.label}</div>
                      <div className="text-xs opacity-75 hidden sm:block">{venue.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symbol Switcher */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Trading Pair</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SYMBOLS.map((symbol) => (
                    <button
                      key={symbol.value}
                      onClick={() => setSelectedSymbol(symbol.value)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedSymbol === symbol.value
                          ? 'bg-green-500/20 border-green-400 text-green-300'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold text-sm sm:text-base">{symbol.label}</div>
                      <div className="text-xs opacity-75 hidden sm:block">{symbol.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Orderbook */}
              <OrderbookViewer 
                venue={selectedVenue} 
                symbol={selectedSymbol} 
                simulatedOrder={simulatedOrder} 
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-12 sm:mt-16 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">
            Professional Trading Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Real-Time Data</h3>
              <p className="text-white/70 text-sm sm:text-base">
                Live orderbook updates via WebSocket connections to OKX, Bybit, and Deribit exchanges.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Order Simulation</h3>
              <p className="text-white/70 text-sm sm:text-base">
                Simulate market and limit orders with advanced impact analysis and slippage calculations.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Market Depth Visualization</h3>
              <p className="text-white/70 text-sm sm:text-base">
                Interactive depth charts showing cumulative order volume and market liquidity.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Impact Analysis</h3>
              <p className="text-white/70 text-sm sm:text-base">
                Comprehensive market impact metrics including slippage, fill percentage, and time estimates.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Risk Warnings</h3>
              <p className="text-white/70 text-sm sm:text-base">
                Intelligent alerts for high market impact orders and liquidity constraints.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Multi-Venue Support</h3>
              <p className="text-white/70 text-sm sm:text-base">
                Compare orderbook data across multiple exchanges for optimal execution strategies.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">GoQuant Orderbook Simulator</h3>
              <p className="text-white/60 text-sm">
                Professional-grade trading simulation platform designed for the GoQuant recruitment assessment.
                Demonstrating advanced real-time data integration and order impact analysis capabilities.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Supported Exchanges</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>• OKX - Global cryptocurrency exchange</li>
                <li>• Bybit - Professional derivatives platform</li>
                <li>• Deribit - Options and futures exchange</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Technical Stack</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>• Next.js 15 with TypeScript</li>
                <li>• WebSocket real-time connections</li>
                <li>• Advanced data visualization</li>
                <li>• Responsive Tailwind CSS design</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} GoQuant Assessment Submission. 
              Built by Naman Bhatt for recruitment evaluation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

