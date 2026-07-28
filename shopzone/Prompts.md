# AI Debugging Sessions — ShopZone Sprint 6

## Session 1 — Understanding useEffect Dependency Array
**Date:** [Your date]
**Tool:** ChatGPT

**My Prompt:**
"Why does my product detail page still show the old product when I navigate 
from /product/1 to /product/2? My useEffect fetches data but it's not re-running."

**AI Explanation Summary:**
The AI explained that useEffect tracks changes to values in its dependency array.
Since I had an empty [], the effect ran once on mount and never again.
Adding `id` from useParams() to the array causes the effect to re-run whenever
the URL parameter changes.

**What I Changed:**
Changed `useEffect(() => { fetchProduct() }, [])` 
to `useEffect(() => { fetchProduct() }, [id])`

**Learning:**
useEffect's dependency array is how React knows WHEN to re-run side effects.
Empty array = run once. [value] = run when value changes.

---

## Session 2 — Understanding Context API vs Props
**Date:** [Your date]
**Tool:** Claude

**My Prompt:**
"Explain the difference between passing cart data through props vs Context API.
When does prop drilling become a problem?"

**AI Explanation Summary:**
The AI explained that prop drilling becomes painful when you need to pass data
through 3+ component levels where intermediate components don't use that data —
they're just forwarding it. Context creates a direct channel between the provider
and any consuming component, regardless of depth.

**Learning:**
Context is not a replacement for all props. Use props for data that
directly relates to a component's job. Use Context for truly global
data (auth state, cart, theme, language).

---

## Session 3 — Vercel 404 on Route Refresh
**Date:** [Your date]
**Tool:** ChatGPT

**My Prompt:**
"My Vite React app works on localhost but when deployed to Vercel, 
refreshing any route other than / gives a 404 error. Why?"

**AI Explanation Summary:**
The AI explained the SPA routing conflict: Vercel's CDN serves static files.
When you request /shop, it looks for a file at /shop/index.html — which doesn't
exist. The vercel.json rewrite rule intercepts ALL requests and serves index.html,
letting React Router handle routing in the browser.

**What I Added:**
Created vercel.json with the rewrites configuration from the sprint FAQ.

---

## Session 4 — LocalStorage Persistence Pattern
**Date:** [Your date]
**Tool:** Gemini

**My Prompt:**
"How do I initialize React state from localStorage so cart data 
survives a page refresh? What's the correct pattern?"

**AI Explanation Summary:**
The AI showed me the lazy initialization pattern: passing a function to useState
instead of a value. The function runs only once on mount, reads localStorage,
and returns the parsed data. Combined with a useEffect that writes to localStorage
on every cartItems change, this creates bi-directional persistence.

**Learning:**
useState(() => { ... }) — the function form — is for expensive initialization.
It prevents the function from running on every re-render.