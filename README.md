# Fulfillment Orchestrator (Starter Exercise)

This service receives `OrderPaid` events and triggers downstream shipment fulfillment.

The current implementation is intentionally incomplete and may behave incorrectly under duplicate delivery, transient downstream failure, and partial system failure.

## Timebox

Spend around **45–60 minutes** improving the service. You do not need to finish everything.

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
- `GET /failed-events`
- `POST /replay/:id`
- `GET /health`

## Candidate Instructions

Improve the system as far as you can within the timebox. We evaluate prioritization, reasoning, and code quality.

Expected focus:

- improve duplicate-handling behavior to reduce duplicate fulfillment side effects
- improve failure/recovery behavior (including replay path safety)
- add targeted tests for high-risk behavior (duplicate and/or failure/recovery scenarios)

AI tools are welcome. Usage itself is not scored positively or negatively.
If you use AI, include either:

- your transcript/session log,
- a short Loom walkthrough.
  (Bulleted summaries alone are not sufficient.)

## Internal Maintainers

This repository is public and only contains candidate-facing materials.

Internal reviewer materials are stored in the company Google Drive docs.
