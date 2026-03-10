import { afterEach, describe, expect, it } from "vitest";
import { createTestApp } from "../../test/support/build-app.js";

let cleanup: (() => Promise<void>) | null = null;

afterEach(async () => {
  if (cleanup) {
    await cleanup();
    cleanup = null;
  }
});

describe("order-paid.route", () => {
  describe("when the payload is invalid", () => {
    it("returns 400 with validation details", async () => {
      const setup = await createTestApp();
      cleanup = setup.cleanup;

      const response = await setup.app.inject({
        method: "POST",
        url: "/events/order-paid",
        payload: {
          orderId: "ord-1",
          amount: -10
        }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().status).toBe("invalid_payload");
    });
  });

  describe("when the payload is valid", () => {
    it("returns the accepted processing result", async () => {
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
      expect(response.json()).toMatchObject({
        orderId: payload.orderId,
        eventId: payload.eventId,
        status: "fulfilled"
      });
      expect(setup.getFulfilledCount(payload.orderId)).toBe(1);
    });
  });
});
