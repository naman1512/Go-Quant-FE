import { useState, useEffect } from "react";
import { VENUES } from "@/lib/exchanges";
import { SYMBOLS, ORDER_TYPES, SIDES, TIMINGS, QUANTITY_PRESETS } from "@/lib/orderFormOptions";

interface SimOrder {
  venue: string;
  symbol: string;
  orderType: string;
  side: string;
  price?: string;
  quantity: string;
  timing: number;
}

interface OrderFormProps {
  onSimulate: (order: SimOrder) => void;
}

interface FormErrors {
  venue?: string;
  symbol?: string;
  orderType?: string;
  side?: string;
  price?: string;
  quantity?: string;
}

export default function OrderForm({ onSimulate }: OrderFormProps) {
  const [venue, setVenue] = useState(VENUES[0].value);
  const [symbol, setSymbol] = useState(SYMBOLS[0].value);
  const [orderType, setOrderType] = useState(ORDER_TYPES[0].value);
  const [side, setSide] = useState(SIDES[0].value);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [timing, setTiming] = useState(TIMINGS[0].value);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset price when switching to market order
  useEffect(() => {
    if (orderType === "market") {
      setPrice("");
    }
  }, [orderType]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    
    if (!venue) errs.venue = "Venue is required";
    if (!symbol) errs.symbol = "Symbol is required";
    if (!orderType) errs.orderType = "Order type is required";
    if (!side) errs.side = "Side is required";
    
    if (orderType === "limit") {
      if (!price) {
        errs.price = "Price is required for limit orders";
      } else if (isNaN(Number(price)) || Number(price) <= 0) {
        errs.price = "Price must be a positive number";
      }
    }
    
    if (!quantity) {
      errs.quantity = "Quantity is required";
    } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      errs.quantity = "Quantity must be a positive number";
    } else if (Number(quantity) > 1000) {
      errs.quantity = "Quantity cannot exceed 1000 for simulation";
    }

    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const errs = validate();
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setIsSubmitting(true);
      
      // Simulate processing delay for better UX
      setTimeout(() => {
        onSimulate({ 
          venue, 
          symbol, 
          orderType, 
          side, 
          price: orderType === "limit" ? price : undefined, 
          quantity, 
          timing 
        });
        setIsSubmitting(false);
      }, 500);
    }
  }

  function handleQuickFill(preset: string) {
    setQuantity(preset);
    setErrors(prev => ({ ...prev, quantity: undefined }));
  }

  function clearForm() {
    setPrice("");
    setQuantity("");
    setErrors({});
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Order Simulation</h2>
        <p className="text-white/70 text-sm sm:text-base">Configure your order parameters to see market impact analysis</p>
      </div>

      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        {/* Venue Selection */}
        <div className="space-y-2">
          <label htmlFor="venue" className="text-white font-semibold text-sm">
            Exchange Venue
          </label>
          <select 
            id="venue" 
            value={venue} 
            onChange={e => setVenue(e.target.value)}
            className="w-full bg-gray-900 border border-white/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
          >
            {VENUES.map(v => (
              <option key={v.value} value={v.value} className="bg-gray-900 text-white">
                {v.label}
              </option>
            ))}
          </select>
          {VENUES.find(v => v.value === venue)?.description && (
            <p className="text-white/60 text-xs">
              {VENUES.find(v => v.value === venue)?.description}
            </p>
          )}
          {errors.venue && <span className="text-red-400 text-xs">{errors.venue}</span>}
        </div>

        {/* Symbol Selection */}
        <div className="space-y-2">
          <label htmlFor="symbol" className="text-white font-semibold text-sm">
            Trading Pair
          </label>
          <select 
            id="symbol" 
            value={symbol} 
            onChange={e => setSymbol(e.target.value)}
            className="w-full bg-gray-900 border border-white/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
          >
            {SYMBOLS.map(s => (
              <option key={s.value} value={s.value} className="bg-gray-900 text-white">
                {s.label}
              </option>
            ))}
          </select>
          {SYMBOLS.find(s => s.value === symbol)?.description && (
            <p className="text-white/60 text-xs">
              {SYMBOLS.find(s => s.value === symbol)?.description}
            </p>
          )}
          {errors.symbol && <span className="text-red-400 text-xs">{errors.symbol}</span>}
        </div>

        {/* Order Type and Side Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <label htmlFor="orderType" className="text-white font-semibold text-sm">
              Order Type
            </label>
            <select 
              id="orderType" 
              value={orderType} 
              onChange={e => setOrderType(e.target.value)}
              className="w-full bg-gray-900 border border-white/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
            >
              {ORDER_TYPES.map(o => (
                <option key={o.value} value={o.value} className="bg-gray-900 text-white">
                  {o.label}
                </option>
              ))}
            </select>
            {ORDER_TYPES.find(o => o.value === orderType)?.description && (
              <p className="text-white/60 text-xs hidden sm:block">
                {ORDER_TYPES.find(o => o.value === orderType)?.description}
              </p>
            )}
            {errors.orderType && <span className="text-red-400 text-xs">{errors.orderType}</span>}
          </div>

          <div className="space-y-2">
            <label htmlFor="side" className="text-white font-semibold text-sm">
              Order Side
            </label>
            <select 
              id="side" 
              value={side} 
              onChange={e => setSide(e.target.value)}
              className="w-full bg-gray-900 border border-white/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
            >
              {SIDES.map(s => (
                <option key={s.value} value={s.value} className="bg-gray-900 text-white">
                  {s.label}
                </option>
              ))}
            </select>
            {SIDES.find(s => s.value === side)?.description && (
              <p className="text-white/60 text-xs hidden sm:block">
                {SIDES.find(s => s.value === side)?.description}
              </p>
            )}
            {errors.side && <span className="text-red-400 text-xs">{errors.side}</span>}
          </div>
        </div>

        {/* Price Input (only for limit orders) */}
        {orderType === "limit" && (
          <div className="space-y-2">
            <label htmlFor="price" className="text-white font-semibold text-sm">
              Limit Price (USD)
            </label>
            <input 
              id="price" 
              type="number" 
              step="0.01"
              placeholder="Enter limit price..." 
              value={price} 
              onChange={e => setPrice(e.target.value)}
              className="w-full bg-gray-900 border border-white/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition placeholder:text-white/40"
            />
            <p className="text-white/60 text-xs">
              Order will only execute at this price or better
            </p>
            {errors.price && <span className="text-red-400 text-xs">{errors.price}</span>}
          </div>
        )}

        {/* Quantity Input */}
        <div className="space-y-2">
          <label htmlFor="quantity" className="text-white font-semibold text-sm">
            Quantity
          </label>
          <input 
            id="quantity" 
            type="number" 
            step="0.0001"
            placeholder="Enter quantity..." 
            value={quantity} 
            onChange={e => setQuantity(e.target.value)}
            className="w-full bg-gray-900 border border-white/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition placeholder:text-white/40"
          />
          
          {/* Quick Fill Presets */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-white/60 text-xs self-center">Quick fill:</span>
            {QUANTITY_PRESETS.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleQuickFill(preset.value)}
                className="px-2 sm:px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {errors.quantity && <span className="text-red-400 text-xs">{errors.quantity}</span>}
        </div>

        {/* Timing Simulation */}
        <div className="space-y-2">
          <label htmlFor="timing" className="text-white font-semibold text-sm">
            Execution Timing Simulation
          </label>
          <select 
            id="timing" 
            value={timing} 
            onChange={e => setTiming(Number(e.target.value))}
            className="w-full bg-gray-900 border border-white/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
          >
            {TIMINGS.map(t => (
              <option key={t.value} value={t.value} className="bg-gray-900 text-white">
                {t.label}
              </option>
            ))}
          </select>
          {TIMINGS.find(t => t.value === timing)?.description && (
            <p className="text-white/60 text-xs hidden sm:block">
              {TIMINGS.find(t => t.value === timing)?.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`flex-1 font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base ${
              isSubmitting 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                Simulating...
              </span>
            ) : (
              'Simulate Order'
            )}
          </button>
          
          <button 
            type="button" 
            onClick={clearForm}
            className="px-4 sm:px-6 py-2 sm:py-3 border border-white/40 text-white font-bold rounded-lg hover:bg-white hover:text-black transition-all duration-200 text-sm sm:text-base"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Form Summary */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-3 sm:p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-2 text-sm">Order Summary</h3>
        <div className="space-y-1 text-xs text-white/70">
          <div className="flex justify-between">
            <span>Exchange:</span>
            <span className="text-white text-right">{VENUES.find(v => v.value === venue)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span>Pair:</span>
            <span className="text-white text-right">{SYMBOLS.find(s => s.value === symbol)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className={`text-right ${side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
              {ORDER_TYPES.find(o => o.value === orderType)?.label} {SIDES.find(s => s.value === side)?.label}
            </span>
          </div>
          {orderType === "limit" && price && (
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="text-white font-mono text-right">${Number(price).toFixed(2)}</span>
            </div>
          )}
          {quantity && (
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span className="text-white font-mono text-right">{Number(quantity).toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
