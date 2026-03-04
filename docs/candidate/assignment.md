# Backend Reliability Exercise: Fulfillment Orchestrator

## Context
You are inheriting a TypeScript backend service that receives `OrderPaid` events and triggers downstream shipment fulfillment.

The system is intentionally incomplete. It may behave incorrectly under:
- duplicate delivery
- transient downstream failures
- partial system failures

## Objective
Improve the system as far as you can in **45–60 minutes**.

You do not need to finish everything. Prioritize what matters most and make reasonable tradeoffs.

## Expected Focus Areas
Your solution should aim to improve at least these areas:
- duplicate fulfillment protection (event/order re-delivery behavior)
- failure handling and recovery behavior (including replay path safety)
- targeted tests that verify at least one duplicate or failure/recovery scenario

## What We Evaluate
- prioritization and decision-making
- reliability thinking under failure/duplicates
- code quality and maintainability
- testing strategy
- clarity of communication

## Constraints
- Keep changes scoped and practical.
- You can refactor, but avoid unnecessary architecture expansion.
- You may add tests and docs.
- AI tools are welcome.

## Runbook
```bash
npm install
npm run setup
npm test
npm run smoke
npm run dev
```

## API Endpoints
- `POST /events/order-paid`
- `GET /orders/:orderId`
- `GET /failed-events`
- `POST /replay/:id`
- `GET /health`

## Deliverables
1. Fork this repository to your own GitHub account.
2. Implement your solution in your fork (main branch or a feature branch).
3. Do **not** open a pull request to the upstream/original repository.
4. Preferred: create a pull request **within your own fork** (for example, `your-branch` -> `your-main`) and share that PR link.
5. If you do not use a PR workflow, share your fork URL and branch name.
6. Include a short summary (`NOTES.md` in repo root or PR description):
   - what you changed
   - why you prioritized those changes
   - what remains and why
   - what you would do next with more time
7. Include evidence of validation (tests run, key scenarios checked).
8. If you used AI, include either:
   - a transcript/session log link, or
   - a Loom link showing how you used AI.
   (Bulleted summaries alone are not sufficient.)

## AI Usage Policy
- AI usage is not scored positively or negatively by itself.
- We evaluate the quality of your engineering decisions, code, tests, and validation.
- If you use AI, provide a transcript/session log link or Loom link so we can understand your process and verification steps.
