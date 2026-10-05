import { memo } from "react";

// --- Phase 3: Render Optimization ---
// Wrapped in React.memo so this card only re-renders when its own
// `product` or `onAdd` props actually change reference — not just
// because its parent (ProductGrid) re-rendered. This pairs with the
// stable `onAdd` reference from useCallback in ProductGrid and the
// stable `product` object references coming out of the useMemo'd
// filtered list, so most re-renders are skipped in practice.
function ProductCard({ product, onAdd }) {
  return (
    <div className="product-card">
      <span className="product-emoji">{product.emoji}</span>
      <span className="product-name">{product.name}</span>
      <span className="product-category">{product.category}</span>
      <span className="product-price">₹{product.price}</span>
      <button className="add-btn" onClick={() => onAdd(product)}>
        Add to Cart
      </button>
    </div>
  );
}

export default memo(ProductCard);
