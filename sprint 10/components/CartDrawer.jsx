"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotal,
  incrementQty,
  decrementQty,
  removeFromCart,
} from "../store/slices/cartSlice";

export default function CartDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <div className={`cart-drawer ${open ? "open" : ""}`}>
        <h2>Your Cart</h2>
        {items.length === 0 && <p className="empty-state">Cart is empty.</p>}
        {items.map((item) => (
          <div className="cart-item" key={item.id}>
            <span className="product-emoji">{item.emoji}</span>
            <div className="cart-item-info">
              <div>{item.name}</div>
              <div className="product-category">
                ₹{item.price} × {item.qty}
              </div>
            </div>
            <div className="qty-controls">
              <button onClick={() => dispatch(decrementQty(item.id))}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => dispatch(incrementQty(item.id))}>+</button>
            </div>
            <button
              className="remove-btn"
              onClick={() => dispatch(removeFromCart(item.id))}
            >
              Remove
            </button>
          </div>
        ))}
        {items.length > 0 && (
          <div className="cart-total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        )}
      </div>
    </>
  );
}
