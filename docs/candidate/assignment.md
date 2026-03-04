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
1. Clone this repository locally.
2. Create a **new private repository** in your own GitHub account for your solution.
3. Push your solution to that private repository (main branch or a feature branch).
4. Add the assigned reviewer GitHub users as collaborators.
5. Preferred: open a pull request inside your private repository (for example, `your-branch` -> `your-main`) and share that PR link.
6. If you do not use a PR workflow, share your private repository URL and branch name.
7. Do **not** open a pull request to the upstream/original public repository.
8. Include a short summary (`NOTES.md` in repo root or PR description):
   - what you changed
   - why you prioritized those changes
   - what remains and why
   - what you would do next with more time
9. Include evidence of validation (tests run, key scenarios checked).
10. If you used AI, include either:
   - a transcript/session log link, or
   - a Loom link showing how you used AI.
   (Bulleted summaries alone are not sufficient.)

## AI Usage Policy
- AI usage is not scored positively or negatively by itself.
- We evaluate the quality of your engineering decisions, code, tests, and validation.
- If you use AI, provide a transcript/session log link or Loom link so we can understand your process and verification steps.
