"use client";

import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import products from "../data/products";
import { selectFilters } from "../store/slices/filterSlice";
import { addToCart } from "../store/slices/cartSlice";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  const dispatch = useDispatch();
  const { category, maxPrice, search } = useSelector(selectFilters);

  // --- Phase 3: Re-render Mitigation ---
  // Recompute the filtered list only when filters or the source array
  // change, not on every render (e.g. when the cart or theme updates).
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesPrice = p.price <= maxPrice;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [category, maxPrice, search]);

  // Stable handler reference so ProductCard (if memoized) doesn't
  // re-render purely because the parent re-rendered.
  const handleAdd = useCallback(
    (product) => {
      dispatch(addToCart(product));
    },
    [dispatch]
  );

  return (
    <section>
      <p className="grid-meta">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
      </p>
      {filtered.length === 0 ? (
        <div className="empty-state">No products match your filters.</div>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </section>
  );
}
