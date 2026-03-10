# Fulfillment Orchestrator (Starter Exercise)

This service receives `OrderPaid` events and triggers downstream shipment fulfillment.

The current implementation is intentionally incomplete and may behave incorrectly under duplicate delivery and one bounded transient downstream failure case.

## Timebox

Spend **60 minutes** improving the service. You do not need to finish everything.

## Quickstart (Recommended: Native)

Requirements:

- Node.js 24+
- npm

Bootstrap once:

```bash
npm install
npm run setup
```

Run tests:

```bash
npm test
```

Run a quick health smoke check:

```bash
npm run smoke
```

Start in dev mode:

```bash
npm run dev
```

## Optional Docker Fallback

Use this path if your local Node environment is blocked or inconsistent.

```bash
docker compose up --build
```

Service will be available at `http://localhost:3000`.

## Endpoints

- `POST /events/order-paid`
- `GET /orders/:orderId`
- `GET /health`

## Candidate Instructions

The candidate-facing source of truth lives in:

- [`docs/candidate/assignment.md`](./docs/candidate/assignment.md)
- [`docs/candidate/submission-template.md`](./docs/candidate/submission-template.md)

Use those docs for:

- required exercise scope
- submission workflow
- AI usage requirements
- write-up expectations

## Internal Maintainers

This repository is public and only contains candidate-facing materials.

Internal reviewer materials are stored in the company Google Drive docs.
Internal path: `Engineering > Hiring > Backend > Lead`.
