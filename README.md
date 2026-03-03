# Fulfillment Orchestrator (Starter Exercise)

This service receives `OrderPaid` events and triggers downstream shipment fulfillment.

The current implementation is intentionally incomplete and may behave incorrectly under duplicate delivery, transient downstream failure, and partial system failure.

## Timebox

Spend around **45–60 minutes** improving the service. You do not need to finish everything.

## Running Locally

Requirements:
- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

Start in dev mode:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

## Endpoints

- `POST /events/order-paid`
- `GET /orders/:orderId`
- `GET /failed-events`
- `POST /replay/:id`
- `GET /health`

## Candidate Instructions

Improve the system as far as you can within the timebox. We evaluate prioritization, reasoning, and code quality.

AI tools are allowed. If you use them, include either:
- your transcript/session log, or
- a short Loom walkthrough explaining how you used them.
