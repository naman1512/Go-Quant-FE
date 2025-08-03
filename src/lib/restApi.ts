// REST API fallback for initial orderbook data when WebSocket fails
export interface RestOrderbookData {
  bids: [number, number][];
  asks: [number, number][];
}

// For production deployment, we can use REST APIs as fallback
export const getInitialOrderbook = async (venue: string, symbol: string): Promise<RestOrderbookData | null> => {
  try {
    // These endpoints work in production environments
    if (venue === "okx") {
      const response = await fetch(`https://www.okx.com/api/v5/market/books?instId=${symbol}`);
      const data = await response.json();
      if (data.code === "0" && data.data?.[0]) {
        return {
          bids: data.data[0].bids.slice(0, 15).map(([p, q]: [string, string]) => [Number(p), Number(q)]),
          asks: data.data[0].asks.slice(0, 15).map(([p, q]: [string, string]) => [Number(p), Number(q)])
        };
      }
    }
    // Note: Bybit and Deribit REST APIs also have CORS restrictions in browser
    // In production, these would work through a proxy or server-side implementation
  } catch (error) {
    console.warn(`REST API fallback failed for ${venue}:`, error);
  }
  return null;
};
