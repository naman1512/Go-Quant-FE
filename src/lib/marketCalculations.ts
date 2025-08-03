export interface OrderbookLevel {
  price: number;
  quantity: number;
}

export interface OrderMetrics {
  fillPercentage: number;
  marketImpact: number;
  slippage: number;
  averageFillPrice: number;
  totalCost: number;
  remainingQuantity: number;
  estimatedTimeToFill: number;
  priceImpactWarning: boolean;
  liquidityWarning: boolean;
}

export interface OrderbookImbalance {
  ratio: number;
  interpretation: 'bullish' | 'bearish' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
}

export function calculateOrderMetrics(
  orderbook: { bids: OrderbookLevel[]; asks: OrderbookLevel[] },
  simulatedOrder: {
    side: string;
    price?: string;
    quantity: string;
    orderType: string;
    timing: number;
  }
): OrderMetrics {
  const side = simulatedOrder.side;
  const orderPrice = simulatedOrder.price ? Number(simulatedOrder.price) : 0;
  const orderQuantity = Number(simulatedOrder.quantity);
  const isMarketOrder = simulatedOrder.orderType === 'market';
  
  const relevantLevels = side === 'buy' ? orderbook.asks : orderbook.bids;
  const bestPrice = relevantLevels[0]?.price || 0;
  
  let remainingQuantity = orderQuantity;
  let filledQuantity = 0;
  let totalCost = 0;

  for (const level of relevantLevels) {
    if (remainingQuantity <= 0) break;
    
    const canFillAtLevel = isMarketOrder || 
      (side === 'buy' && level.price <= orderPrice) ||
      (side === 'sell' && level.price >= orderPrice);
    
    if (canFillAtLevel) {
      const fillQuantity = Math.min(level.quantity, remainingQuantity);
      filledQuantity += fillQuantity;
      totalCost += fillQuantity * level.price;
      remainingQuantity -= fillQuantity;
    }
  }

  const fillPercentage = (filledQuantity / orderQuantity) * 100;
  const averageFillPrice = filledQuantity > 0 ? totalCost / filledQuantity : orderPrice;
  const marketImpact = Math.abs(averageFillPrice - bestPrice);
  const slippage = Math.abs(averageFillPrice - (orderPrice || bestPrice));
  
  const priceImpactWarning = marketImpact > bestPrice * 0.005; // 0.5% threshold
  const liquidityWarning = fillPercentage < 95;
  
  // Estimate time to fill based on market conditions and order size
  const baseTimeToFill = simulatedOrder.timing;
  const liquidityAdjustment = fillPercentage < 100 ? (100 - fillPercentage) * 0.1 : 0;
  const estimatedTimeToFill = baseTimeToFill + liquidityAdjustment;

  return {
    fillPercentage,
    marketImpact,
    slippage,
    averageFillPrice,
    totalCost,
    remainingQuantity,
    estimatedTimeToFill,
    priceImpactWarning,
    liquidityWarning
  };
}

export function calculateOrderbookImbalance(
  orderbook: { bids: OrderbookLevel[]; asks: OrderbookLevel[] }
): OrderbookImbalance {
  const bidVolume = orderbook.bids.slice(0, 10).reduce((sum, level) => sum + level.quantity, 0);
  const askVolume = orderbook.asks.slice(0, 10).reduce((sum, level) => sum + level.quantity, 0);
  
  const totalVolume = bidVolume + askVolume;
  const ratio = totalVolume > 0 ? bidVolume / totalVolume : 0.5;
  
  let interpretation: 'bullish' | 'bearish' | 'neutral';
  let strength: 'weak' | 'moderate' | 'strong';
  
  if (ratio > 0.6) {
    interpretation = 'bullish';
    strength = ratio > 0.7 ? 'strong' : 'moderate';
  } else if (ratio < 0.4) {
    interpretation = 'bearish';
    strength = ratio < 0.3 ? 'strong' : 'moderate';
  } else {
    interpretation = 'neutral';
    strength = 'weak';
  }
  
  return { ratio, interpretation, strength };
}

export function getSpreadInfo(orderbook: { bids: OrderbookLevel[]; asks: OrderbookLevel[] }) {
  const bestBid = orderbook.bids[0]?.price || 0;
  const bestAsk = orderbook.asks[0]?.price || 0;
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;
  const spreadPercentage = midPrice > 0 ? (spread / midPrice) * 100 : 0;
  
  return {
    spread,
    spreadPercentage,
    midPrice,
    bestBid,
    bestAsk
  };
}

export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatQuantity(value: number, decimals: number = 4): string {
  return value.toFixed(decimals);
}
