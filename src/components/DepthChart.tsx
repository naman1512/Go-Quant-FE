import React from 'react';

interface DepthChartProps {
  bids: { price: number; quantity: number }[];
  asks: { price: number; quantity: number }[];
  width?: number;
  height?: number;
  simulatedOrder?: {
    side: string;
    price?: string;
    quantity: string;
  } | null;
}

export default function DepthChart({ 
  bids, 
  asks, 
  width = 400, 
  height = 200, 
  simulatedOrder 
}: DepthChartProps) {
  if (!bids.length && !asks.length) {
    return (
      <div 
        className="flex items-center justify-center border border-white/10 rounded-lg"
        style={{
          width: `${width}px`,
          height: `${height}px`
        }}
      >
        <span className="text-white/60">No depth data available</span>
      </div>
    );
  }

  // Calculate cumulative volumes
  const depthBids = bids.reduce((acc: { price: number; cumVolume: number }[], level, index) => {
    const prevVolume = index > 0 ? acc[index - 1].cumVolume : 0;
    acc.push({
      price: level.price,
      cumVolume: prevVolume + level.quantity
    });
    return acc;
  }, []);

  const depthAsks = asks.reduce((acc: { price: number; cumVolume: number }[], level, index) => {
    const prevVolume = index > 0 ? acc[index - 1].cumVolume : 0;
    acc.push({
      price: level.price,
      cumVolume: prevVolume + level.quantity
    });
    return acc;
  }, []);

  // Find price and volume ranges
  const allPrices = [...depthBids.map(d => d.price), ...depthAsks.map(d => d.price)];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const maxVolume = Math.max(
    depthBids.length ? depthBids[depthBids.length - 1].cumVolume : 0,
    depthAsks.length ? depthAsks[depthAsks.length - 1].cumVolume : 0
  );

  // Scaling functions
  const scaleX = (price: number) => ((price - minPrice) / (maxPrice - minPrice || 1)) * width;
  const scaleY = (volume: number) => height - (volume / (maxVolume || 1)) * height;

  // Generate path for bids (green, left side)
  const bidPath = depthBids.length > 0 ? 
    `M 0,${height} ` + 
    depthBids.map(d => `L ${scaleX(d.price)},${scaleY(d.cumVolume)}`).join(' ') +
    ` L ${scaleX(depthBids[depthBids.length - 1].price)},${height} Z` : '';

  // Generate path for asks (red, right side)
  const askPath = depthAsks.length > 0 ? 
    `M ${scaleX(depthAsks[0].price)},${height} ` +
    depthAsks.map(d => `L ${scaleX(d.price)},${scaleY(d.cumVolume)}`).join(' ') +
    ` L ${width},${height} Z` : '';

  // Simulated order indicator
  let orderIndicator = null;
  if (simulatedOrder && simulatedOrder.price) {
    const orderPrice = Number(simulatedOrder.price);
    const x = scaleX(orderPrice);
    const color = simulatedOrder.side === 'buy' ? '#22c55e' : '#ef4444';
    
    orderIndicator = (
      <>
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={color}
          strokeWidth={2}
          strokeDasharray="5,5"
          opacity={0.8}
        />
        <circle
          cx={x}
          cy={height - 10}
          r={4}
          fill={color}
          stroke="white"
          strokeWidth={1}
        />
      </>
    );
  }

  return (
    <div className="relative">
      <svg width={width} height={height} className="border border-white/10 rounded-lg bg-black/20">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Bid area (green) */}
        {bidPath && (
          <path
            d={bidPath}
            fill="rgba(34, 197, 94, 0.2)"
            stroke="#22c55e"
            strokeWidth={2}
          />
        )}
        
        {/* Ask area (red) */}
        {askPath && (
          <path
            d={askPath}
            fill="rgba(239, 68, 68, 0.2)"
            stroke="#ef4444"
            strokeWidth={2}
          />
        )}
        
        {/* Simulated order indicator */}
        {orderIndicator}
        
        {/* Spread indicator */}
        {bids.length > 0 && asks.length > 0 && (
          <rect
            x={scaleX(bids[0].price)}
            y={0}
            width={scaleX(asks[0].price) - scaleX(bids[0].price)}
            height={height}
            fill="rgba(255, 255, 0, 0.1)"
            stroke="rgba(255, 255, 0, 0.3)"
            strokeWidth={1}
          />
        )}
      </svg>
      
      {/* Legend */}
      <div className="flex justify-between items-center mt-2 text-xs text-white/70">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Bids</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Asks</span>
          </div>
          {simulatedOrder && (
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${simulatedOrder.side === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Simulated Order</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div>Price Range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</div>
          <div>Max Volume: {maxVolume.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}
