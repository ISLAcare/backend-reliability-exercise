import { afterEach, describe, expect, it } from "vitest";
import { createTestApp } from "./helpers/test-app.js";

let cleanup: (() => Promise<void>) | null = null;

afterEach(async () => {
  if (cleanup) {
    await cleanup();
    cleanup = null;
  }
});

describe("GET /orders/:orderId", () => {
  it("returns expected shape", async () => {
    const setup = await createTestApp("success");
    cleanup = setup.cleanup;

    const payload = {
      eventId: "evt-order-shape",
      orderId: "ord-shape",
      occurredAt: new Date().toISOString(),
      amount: 1500,
      currency: "USD"
    };

    await setup.app.inject({
      method: "POST",
      url: "/events/order-paid",
      payload
    });

    const response = await setup.app.inject({
      method: "GET",
      url: `/orders/${payload.orderId}`
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
      status: "fulfilled"
    });
    expect(typeof body.createdAt).toBe("string");
    expect(typeof body.updatedAt).toBe("string");
  });
});
