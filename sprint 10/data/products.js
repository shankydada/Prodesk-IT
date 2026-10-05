// Mock catalog. Swap this for a real API call / DB fetch in production.
const products = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 2499, emoji: "🎧" },
  { id: 2, name: "Mechanical Keyboard", category: "Electronics", price: 3999, emoji: "⌨️" },
  { id: 3, name: "Running Shoes", category: "Footwear", price: 2999, emoji: "👟" },
  { id: 4, name: "Leather Wallet", category: "Accessories", price: 899, emoji: "👛" },
  { id: 5, name: "Smart Watch", category: "Electronics", price: 5999, emoji: "⌚" },
  { id: 6, name: "Yoga Mat", category: "Fitness", price: 799, emoji: "🧘" },
  { id: 7, name: "Denim Jacket", category: "Apparel", price: 2199, emoji: "🧥" },
  { id: 8, name: "Sunglasses", category: "Accessories", price: 1299, emoji: "🕶️" },
  { id: 9, name: "Backpack", category: "Accessories", price: 1899, emoji: "🎒" },
  { id: 10, name: "Bluetooth Speaker", category: "Electronics", price: 1799, emoji: "🔊" },
  { id: 11, name: "Sneakers", category: "Footwear", price: 3499, emoji: "👞" },
  { id: 12, name: "Water Bottle", category: "Fitness", price: 499, emoji: "🥤" },
  { id: 13, name: "Graphic T-Shirt", category: "Apparel", price: 699, emoji: "👕" },
  { id: 14, name: "Dumbbell Set", category: "Fitness", price: 2599, emoji: "🏋️" },
  { id: 15, name: "Gaming Mouse", category: "Electronics", price: 1499, emoji: "🖱️" },
];

export default products;

export const CATEGORIES = [...new Set(products.map((p) => p.category))];
export const MAX_PRICE = Math.max(...products.map((p) => p.price));
