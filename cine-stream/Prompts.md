# Cine-Stream AI & Debugging Prompts

## Prompt Log

### 1. Initial app architecture
"Build a Netflix-inspired movie discovery SPA in React with TMDB integration, favorites persistence, debounced search, and infinite scroll. Keep the code production-ready and polished."

### 2. Performance debugging
"Explain how to prevent duplicate fetches and infinite loops when using a debounced search and IntersectionObserver in React. Suggest a safe pattern with dependencies and state resets."

### 3. UI polish
"Create a premium dark-theme layout with a cinematic hero panel, responsive movie grid, and accessible favorites button styling that works across desktop and mobile." 

### 4. Fallback strategy
"If the TMDB API key is missing, provide a graceful fallback that still displays a working movie grid and lets search/filter logic continue safely without crashing."

### 5. Mood matcher
"Design a simple mood-based movie suggestion flow that uses an LLM title suggestion and then feeds that title into the TMDB search endpoint without exposing secrets in the frontend." 

## Notes
- The app uses the native `IntersectionObserver` API to trigger supplemental requests as users approach the end of the grid.
- Debouncing is handled through a 500ms timeout before updating the query used for the fetch request.
- Favorites persist in `localStorage` under the key `cine-stream-favorites`.
- The app includes a fallback movie list when an API key is unavailable, which keeps the UI functional during local development and deployment without credentials.
