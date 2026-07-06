# Dev-Detective – GitHub Profile Explorer

Dev-Detective is a vanilla JavaScript web application that integrates with the GitHub REST API to search developer profiles, display repository information, and compare two GitHub users using Battle Mode.

The project demonstrates asynchronous JavaScript concepts including Fetch API, Promises, Async/Await, Promise.all(), JSON parsing, and client-side validation.

---

## Features

### Phase 1 – Base MVP

- Search GitHub users by username.
- Fetch user profile using the GitHub REST API.
- Display:
  - Avatar
  - Name
  - Bio
  - Join Date
  - Portfolio URL
- Loading indicator during API requests.
- User-friendly "User Not Found" error handling.
- Prevents application crashes during failed requests.

### Phase 2 – Data Expansion

- Fetch user repositories after loading profile data.
- Display the latest five repositories.
- Repository links open in a new browser tab.
- Human-readable date formatting.
- Handles users with no public repositories.

### Phase 3 – Battle Mode

- Toggle between Single Search and Battle Mode.
- Compare two GitHub users simultaneously using Promise.all().
- Calculate total repository stars using reduce().
- Display Winner and Runner-up based on total stars.

---

## Additional Features

- Client-side form validation.
- XSS-safe rendering using input sanitization.
- Responsive design for desktop, tablet, and mobile.
- Keyboard accessible interface.
- ARIA labels and semantic HTML.
- Dedicated error handling for:
  - Invalid input
  - User not found
  - Network failure
  - API rate limit
  - Invalid server response

---

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- GitHub REST API
- Fetch API
- Async/Await
- Promise.all()

---

## Running the Project

Since this project uses ES Modules, it must be served through a local web server.

### Option 1 – VS Code Live Server

1. Install the Live Server extension.
2. Right-click `index.html`.
3. Select **Open with Live Server**.

### Option 2 – Python

```bash
python -m http.server 5500
```

Open:

```
http://localhost:5500
```

### Option 3 – Node.js

```bash
npx serve .
```

---

## API Rate Limit

GitHub allows up to **60 unauthenticated API requests per hour**.

If the rate limit is exceeded, generate a GitHub Personal Access Token and include it in the request headers to increase the limit.

---

## Accessibility

The application includes:

- Semantic HTML elements
- Keyboard navigation support
- ARIA labels and live regions
- Accessible form validation
- Focus-visible styling
- Screen reader friendly content

---

## Edge Cases Handled

- Empty username
- Invalid username format
- User not found (404)
- API rate limit (403)
- Network connectivity issues
- Invalid JSON response
- Missing avatar
- Missing bio
- Missing portfolio URL
- No public repositories
- Same username entered in Battle Mode

---

## QA Demonstration

The application demonstrates:

1. Initial empty state.
2. Successful user search.
3. Loading state.
4. User Not Found error.
5. Battle Mode comparison.
6. Winner and Runner-up display.
7. Validation for duplicate usernames.

---

## Author

shashank roy