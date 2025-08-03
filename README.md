# GoQuant Real-Time Orderbook Viewer & Order Simulation Platform

> **Professional-grade cryptocurrency trading simulation platform designed for the GoQuant recruitment assessment**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🚀 Overview

This application is a comprehensive real-time orderbook visualization and order simulation platform that integrates with multiple cryptocurrency exchanges (OKX, Bybit, and Deribit). It provides professional-grade trading analytics, market impact analysis, and advanced order simulation capabilities.

### 🎯 Key Features

- **🔴 Real-Time Data Integration**: Live WebSocket connections to OKX, Bybit, and Deribit
- **📊 Advanced Orderbook Visualization**: 15+ levels of bids/asks with professional UI
- **🎯 Order Simulation Engine**: Market and limit order simulation with impact analysis
- **📈 Market Depth Charts**: Interactive SVG-based depth visualization
- **⚡ Impact Analytics**: Comprehensive slippage, fill rate, and market impact calculations
- **⚠️ Risk Warnings**: Intelligent alerts for high-impact orders and liquidity constraints
- **🔄 Multi-Venue Support**: Seamless switching between exchanges
- **📱 Responsive Design**: Optimized for desktop and mobile trading scenarios
- **🎨 Professional UI**: Dark theme with trading-focused design language

## 🏗️ Architecture & Technical Implementation

### Frontend Stack

- **Next.js 15**: React framework with App Router and TypeScript
- **WebSocket Management**: Custom hooks for real-time data streaming
- **State Management**: React hooks with optimized re-rendering
- **Styling**: Tailwind CSS with custom components and animations
- **Data Visualization**: Custom SVG-based charts and interactive elements

### Exchange Integration

- **OKX**: WebSocket orderbook streams with 15-level depth
- **Bybit**: Real-time linear futures orderbook data
- **Deribit**: Professional options/futures exchange integration

### Order Simulation Engine

- **Market Impact Calculation**: Advanced algorithms for price impact analysis
- **Slippage Estimation**: Real-time slippage calculations based on orderbook depth
- **Fill Rate Analysis**: Percentage fill calculations with liquidity constraints
- **Timing Simulation**: Configurable execution delay scenarios (0s, 5s, 10s, 30s)

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Modern web browser with WebSocket support

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd goquant-orderbook-simulator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🎮 Usage Guide

### Order Simulation Workflow

1. **Select Exchange Venue**: Choose between OKX, Bybit, or Deribit
2. **Choose Trading Pair**: Select from BTC/USD, ETH/USD, or SOL/USD
3. **Configure Order Parameters**:
   - Order Type: Market or Limit
   - Side: Buy or Sell
   - Price (for limit orders)
   - Quantity
   - Timing simulation (immediate to 30s delay)
4. **Analyze Results**: View comprehensive impact metrics and warnings

### Orderbook Features

- **Real-time Updates**: Live price and volume data via WebSocket
- **15-Level Depth**: Professional-grade orderbook depth
- **Visual Indicators**: Highlighted simulated order placement
- **Market Summary**: Spread, mid-price, and imbalance analysis
- **Connection Status**: Real-time connection monitoring

### Market Depth Visualization

- **Interactive Charts**: SVG-based depth charts with cumulative volume
- **Bid/Ask Areas**: Color-coded visualization of market liquidity
- **Simulated Order Overlay**: Visual representation of order placement
- **Spread Indicators**: Real-time spread analysis

## 📊 Advanced Features & Analytics

### Order Impact Metrics

- **Fill Percentage**: Estimated order fill based on available liquidity
- **Market Impact**: Price movement caused by order execution
- **Slippage Analysis**: Difference between expected and actual fill price
- **Time to Fill**: Estimated execution time based on market conditions

### Risk Management Features

- **Liquidity Warnings**: Alerts for insufficient market depth
- **High Impact Alerts**: Warnings for orders that may move the market significantly
- **Spread Analysis**: Real-time bid-ask spread monitoring
- **Orderbook Imbalance**: Market sentiment indicators

### Multi-Exchange Comparison

- **Venue Switching**: Instant switching between exchanges
- **Symbol Mapping**: Automatic symbol translation between exchanges
- **Connection Management**: Independent WebSocket connections per exchange
- **Error Handling**: Robust fallback mechanisms and reconnection logic

## 🔧 Technical Specifications

### WebSocket Implementation

```typescript
// Example WebSocket subscription for OKX
const subscriptionMessage = {
  op: "subscribe",
  args: [{ channel: "books", instId: "BTC-USDT" }],
};
```

### Order Metrics Calculation

```typescript
// Simplified order impact calculation
const calculateOrderMetrics = (orderbook, simulatedOrder) => {
  // Advanced algorithms for:
  // - Fill percentage calculation
  // - Market impact analysis
  // - Slippage estimation
  // - Time to fill prediction
};
```

### Real-time Data Flow

1. WebSocket connection establishment
2. Exchange-specific subscription messages
3. Real-time orderbook updates
4. State management and UI updates
5. Order simulation and impact calculation

## 📚 API Documentation & References

### Exchange APIs

- **[OKX API Documentation](https://www.okx.com/docs-v5/)**: Comprehensive trading API
- **[Bybit API Documentation](https://bybit-exchange.github.io/docs/v5/intro)**: Professional derivatives API
- **[Deribit API Documentation](https://docs.deribit.com/)**: Options and futures API

### Rate Limiting Considerations

- **OKX**: 20 requests per 2 seconds for public endpoints
- **Bybit**: 120 requests per minute for public endpoints
- **Deribit**: 20 requests per second for public endpoints

### WebSocket Endpoints

- **OKX**: `wss://ws.okx.com:8443/ws/v5/public`
- **Bybit**: `wss://stream.bybit.com/v5/public/linear`
- **Deribit**: `wss://www.deribit.com/ws/api/v2`

## 🧪 Testing & Quality Assurance

### Code Quality

- **TypeScript**: Full type safety and interface definitions
- **ESLint**: Code linting with Next.js best practices
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Performance**: Optimized re-rendering and WebSocket management

### Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **WebSocket Support**: Full WebSocket API compatibility required
- **Responsive Design**: Tested on desktop, tablet, and mobile devices

## 🚀 Deployment & Production

### Vercel Deployment (Recommended)

```bash
npm run build
# Deploy to Vercel or your preferred platform
```

### Environment Configuration

- No environment variables required for demo
- All exchanges use public endpoints
- WebSocket connections are client-side only

## 📈 Performance Optimizations

### WebSocket Management

- **Connection Pooling**: Efficient connection management
- **Automatic Reconnection**: Exponential backoff strategy
- **Memory Management**: Proper cleanup on component unmount

### UI Optimizations

- **Debounced Updates**: Efficient orderbook rendering
- **Virtualization**: Large dataset handling
- **Lazy Loading**: On-demand component loading

## 🎥 Video Demonstration

A comprehensive video demonstration is included with the submission, covering:

- Application walkthrough and features
- Code architecture explanation
- Real-time functionality demonstration
- Order simulation scenarios
- Technical implementation details

## 🤝 Submission Checklist

- ✅ **Multi-venue orderbook display** (OKX, Bybit, Deribit)
- ✅ **15+ levels of bids/asks** per venue
- ✅ **Real-time WebSocket updates**
- ✅ **Order simulation form** with all required fields
- ✅ **Order placement visualization** with impact metrics
- ✅ **Responsive design** for desktop and mobile
- ✅ **Market depth charts** (bonus feature)
- ✅ **Orderbook imbalance indicators** (bonus feature)
- ✅ **Slippage warnings** (bonus feature)
- ✅ **Market impact calculations** (bonus feature)
- ✅ **Timing scenario simulation** (bonus feature)

## 📞 Contact & Support

This application was developed as part of the GoQuant recruitment assessment. For any questions or clarifications regarding the implementation, please refer to the accompanying video demonstration or contact documentation.

---

**Built with precision for GoQuant recruitment evaluation**  
_Demonstrating advanced real-time trading system capabilities and professional development practices_
