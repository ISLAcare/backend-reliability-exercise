import { afterEach, describe, expect, it } from "vitest";
import { createTestApp } from "./helpers/test-app.js";

let cleanup: (() => Promise<void>) | null = null;

afterEach(async () => {
  if (cleanup) {
    await cleanup();
    cleanup = null;
  }
});

describe("POST /events/order-paid", () => {
  it("processes happy path and fulfills shipment", async () => {
    const setup = await createTestApp("success");
    cleanup = setup.cleanup;

    const payload = {
      eventId: "evt-happy",
      orderId: "ord-happy",
      occurredAt: new Date().toISOString(),
      amount: 1000,
      currency: "USD"
    };

    const response = await setup.app.inject({
      method: "POST",
      url: "/events/order-paid",
      payload
    });

    expect(response.statusCode).toBe(202);
    expect(response.json().status).toBe("fulfilled");

    const orderResponse = await setup.app.inject({
      method: "GET",
      url: `/orders/${payload.orderId}`
    });

    expect(orderResponse.statusCode).toBe(200);
    expect(orderResponse.json().status).toBe("fulfilled");
    expect(setup.getFulfilledCount(payload.orderId)).toBe(1);
  });

  // Duplicate-handling: same eventId sent twice must not trigger fulfillment twice (idempotency).
  it("treats duplicate eventId as idempotent and does not fulfill twice", async () => {
    const setup = await createTestApp("success");
    cleanup = setup.cleanup;

    const payload = {
      eventId: "evt-dup-1",
      orderId: "ord-dup-1",
      occurredAt: new Date().toISOString(),
      amount: 500,
      currency: "USD"
    };

    const first = await setup.app.inject({
      method: "POST",
      url: "/events/order-paid",
      payload
    });
    expect(first.statusCode).toBe(202);
    expect(first.json().status).toBe("fulfilled");

    const second = await setup.app.inject({
      method: "POST",
      url: "/events/order-paid",
      payload
    });
    expect(second.statusCode).toBe(202);
    expect(second.json().status).toBe("fulfilled");
    expect(second.json().message).toContain("Already processed");

    expect(setup.getFulfilledCount(payload.orderId)).toBe(1);
  });
});
