// Sellable stock rules shared by the storefront, checkout and admin.
// `out_of_stock_threshold` lets the store hold back units: a product is sold out once its
// stock is at or below that number (0 = sell every unit).

interface StockFields {
  stock: number;
  low_stock_threshold?: number | null;
  out_of_stock_threshold?: number | null;
}

export const soldOutAt = (p: StockFields) => Math.max(0, Number(p.out_of_stock_threshold ?? 0));

export const availableStock = (p: StockFields) => Math.max(0, Number(p.stock ?? 0) - soldOutAt(p));

export const isSoldOut = (p: StockFields) => availableStock(p) <= 0;

// "Few left" warning: sellable units at or below the low-stock alert level
export const isLowStock = (p: StockFields) => !isSoldOut(p) && availableStock(p) <= Number(p.low_stock_threshold ?? 5);
