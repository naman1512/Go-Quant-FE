export const SYMBOLS = [
  { label: "BTC/USD", value: "BTC-USD", description: "Bitcoin against USD" },
  { label: "ETH/USD", value: "ETH-USD", description: "Ethereum against USD" },
  { label: "SOL/USD", value: "SOL-USD", description: "Solana against USD" },
];

export const ORDER_TYPES = [
  { label: "Market", value: "market", description: "Execute immediately at best available price" },
  { label: "Limit", value: "limit", description: "Execute only at specified price or better" },
];

export const SIDES = [
  { label: "Buy", value: "buy", description: "Purchase the base asset", color: "text-green-400" },
  { label: "Sell", value: "sell", description: "Sell the base asset", color: "text-red-400" },
];

export const TIMINGS = [
  { label: "Immediate", value: 0, description: "Execute order instantly" },
  { label: "5s Delay", value: 5, description: "Simulate 5 second market delay" },
  { label: "10s Delay", value: 10, description: "Simulate 10 second market delay" },
  { label: "30s Delay", value: 30, description: "Simulate 30 second market delay" },
];

export const QUANTITY_PRESETS = [
  { label: "0.01", value: "0.01" },
  { label: "0.1", value: "0.1" },
  { label: "1", value: "1" },
  { label: "10", value: "10" },
];
