import { afterEach, describe, expect, it } from "vitest";
import { createTestApp } from "./helpers/test-app.js";

let cleanup: (() => Promise<void>) | null = null;

afterEach(async () => {
  if (cleanup) {
    await cleanup();
    cleanup = null;
  }
});

describe("failed-events and replay", () => {
  it("records at least one downstream failure in failed-events", async () => {
    const setup = await createTestApp("alwaysFail");
    cleanup = setup.cleanup;

    const payload = {
      eventId: "evt-fail-1",
      orderId: "ord-fail-1",
      occurredAt: new Date().toISOString(),
      amount: 2500,
      currency: "USD"
    };

    const response = await setup.app.inject({
      method: "POST",
      url: "/events/order-paid",
      payload
    });

    expect(response.statusCode).toBe(202);

    const failedEvents = await setup.app.inject({ method: "GET", url: "/failed-events" });
    expect(failedEvents.statusCode).toBe(200);
    expect(failedEvents.json().length).toBeGreaterThan(0);
  });

  it("replays a failed event by id", async () => {
    const setup = await createTestApp("alwaysFail");
    cleanup = setup.cleanup;

    const payload = {
      eventId: "evt-replay-1",
      orderId: "ord-replay-1",
      occurredAt: new Date().toISOString(),
      amount: 3000,
      currency: "USD"
    };

    await setup.app.inject({
      method: "POST",
      url: "/events/order-paid",
      payload
    });

    const failedEvents = await setup.app.inject({ method: "GET", url: "/failed-events" });
    const first = failedEvents.json()[0];

    const replayResponse = await setup.app.inject({
      method: "POST",
      url: `/replay/${first.id}`
    });

    expect(replayResponse.statusCode).toBe(200);
    expect(replayResponse.json().failedEventId).toBe(first.id);
  });

  // Replay path safety: replaying an already-replayed event does not reprocess (no duplicate fulfillment).
  it("replaying already-replayed event returns success without reprocessing", async () => {
    const setup = await createTestApp("failOncePerOrder");
    cleanup = setup.cleanup;

    const payload = {
      eventId: "evt-replay-twice",
      orderId: "ord-replay-twice",
      occurredAt: new Date().toISOString(),
      amount: 1000,
      currency: "USD"
    };

    await setup.app.inject({
      method: "POST",
      url: "/events/order-paid",
      payload
    });

    const failedList = await setup.app.inject({ method: "GET", url: "/failed-events" });
    const failed = failedList.json().find((e: { eventId: string }) => e.eventId === payload.eventId);
    expect(failed).toBeDefined();

    const replay1 = await setup.app.inject({ method: "POST", url: `/replay/${failed.id}` });
    expect(replay1.statusCode).toBe(200);
    expect(replay1.json().result.ok).toBe(true);

    const replay2 = await setup.app.inject({ method: "POST", url: `/replay/${failed.id}` });
    expect(replay2.statusCode).toBe(200);
    expect(replay2.json().result.message).toContain("Already replayed");
    expect(setup.getFulfilledCount(payload.orderId)).toBe(1);
  });
});
