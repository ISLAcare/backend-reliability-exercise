import { afterEach, describe, expect, it } from "vitest";
import { createTestApp } from "../../test/support/build-app.js";

let cleanup: (() => Promise<void>) | null = null;

afterEach(async () => {
  if (cleanup) {
    await cleanup();
    cleanup = null;
  }
});

describe("get-order.route", () => {
  describe("when the order does not exist", () => {
    it("returns 404", async () => {
      const setup = await createTestApp("success");
      cleanup = setup.cleanup;

      const response = await setup.app.inject({
        method: "GET",
        url: "/orders/missing-order"
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().status).toBe("not_found");
    });
  });

  describe("when the order exists", () => {
    it("returns the persisted order shape", async () => {
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

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        orderId: payload.orderId,
        amount: payload.amount,
        currency: payload.currency,
        status: "fulfilled"
      });
    });
  });
});
