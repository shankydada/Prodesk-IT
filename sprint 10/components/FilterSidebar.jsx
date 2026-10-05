"use client";

import { useSelector, useDispatch } from "react-redux";
import { CATEGORIES, MAX_PRICE } from "../data/products";
import {
  selectFilters,
  setCategory,
  setMaxPrice,
  setSearch,
  resetFilters,
} from "../store/slices/filterSlice";

export default function FilterSidebar() {
  const dispatch = useDispatch();
  const { category, maxPrice, search } = useSelector(selectFilters);

  return (
    <aside className="sidebar">
      <h3>Search</h3>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
      />

      <h3>Category</h3>
      <div className="category-list">
        <label>
          <input
            type="radio"
            name="category"
            checked={category === "All"}
            onChange={() => dispatch(setCategory("All"))}
          />
          All
        </label>
        {CATEGORIES.map((cat) => (
          <label key={cat}>
            <input
              type="radio"
              name="category"
              checked={category === cat}
              onChange={() => dispatch(setCategory(cat))}
            />
            {cat}
          </label>
        ))}
      </div>

      <h3>Max Price</h3>
      <p className="price-value">₹{maxPrice}</p>
      <input
        type="range"
        min={0}
        max={MAX_PRICE}
        step={100}
        value={maxPrice}
        onChange={(e) => dispatch(setMaxPrice(e.target.value))}
      />

      <button className="reset-btn" onClick={() => dispatch(resetFilters())}>
        Reset filters
      </button>
    </aside>
  );
}
