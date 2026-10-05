# Wedding Cake Contract & Dietary Waiver

An accessible, multi-step React form for capturing wedding cake contracts and dietary waivers.

## Development

```bash
npm install
npm run dev
```

Run the quality checks with:

```bash
npm run lint
npm test
npm run build
```

## Resilience and safety

- Draft form data is persisted in browser storage so staff can recover after a refresh or connectivity interruption.
- Online/offline status is announced in the form and submissions show a loading state.
- Validation uses shared custom regex rules for names, phone numbers, email addresses, and numeric ranges.
- Text inputs are sanitized before entering React state.
- Primary actions emit the required `[Analytics]` console event.

## Container deployment

```bash
docker build -t wedding-cake-waiver .
docker run --rm -p 8080:80 wedding-cake-waiver
```

The GitHub Actions workflow runs lint, tests, and the production build for changes in this project.
