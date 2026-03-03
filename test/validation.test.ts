import { afterEach, describe, expect, it } from "vitest";
import { createTestApp } from "./helpers/test-app.js";

let cleanup: (() => Promise<void>) | null = null;

afterEach(async () => {
  if (cleanup) {
    await cleanup();
    cleanup = null;
  }
});

describe("POST /events/order-paid validation", () => {
  it("returns 400 for malformed payload", async () => {
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
