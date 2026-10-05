"use client";

import { useSelector, useDispatch } from "react-redux";
import { selectCartCount } from "../store/slices/cartSlice";
import { selectTheme, toggleTheme } from "../store/slices/themeSlice";

export default function Header({ onCartClick }) {
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const mode = useSelector(selectTheme);

  return (
    <header className="header">
      <h1>Sprint 10 · Track A Store</h1>
      <div className="header-actions">
        <button
          className="icon-btn"
          onClick={() => dispatch(toggleTheme())}
          aria-label="Toggle theme"
        >
          {mode === "light" ? "🌙" : "☀️"}
        </button>
        <button className="icon-btn" onClick={onCartClick} aria-label="Open cart">
          🛒
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}
