import type { FulfillmentMode } from "../config.js";

export class FakeFulfillmentError extends Error {
  constructor(public readonly kind: "timeout" | "server_error", message: string) {
    super(message);
    this.name = "FakeFulfillmentError";
  }
}

export type FulfillmentAttempt = {
  orderId: string;
  eventId: string;
  at: string;
  success: boolean;
  mode: FulfillmentMode;
};

export class FakeFulfillmentClient {
  private readonly attempts: FulfillmentAttempt[] = [];
  private readonly attemptCounts = new Map<string, number>();
  private readonly fulfilledCounts = new Map<string, number>();
  private readonly failedOnce = new Set<string>();

  constructor(private readonly mode: FulfillmentMode) {}

  async fulfillShipment(orderId: string, eventId: string): Promise<void> {
    const count = (this.attemptCounts.get(orderId) ?? 0) + 1;
    this.attemptCounts.set(orderId, count);

    const shouldFail = this.shouldFail(orderId);
    const at = new Date().toISOString();

    if (shouldFail) {
      this.attempts.push({ orderId, eventId, at, success: false, mode: this.mode });
      if (count % 2 === 0) {
        throw new FakeFulfillmentError("timeout", "downstream timeout while creating shipment");
      }
      throw new FakeFulfillmentError("server_error", "downstream 500 while creating shipment");
    }

    this.fulfilledCounts.set(orderId, (this.fulfilledCounts.get(orderId) ?? 0) + 1);
    this.attempts.push({ orderId, eventId, at, success: true, mode: this.mode });
  }

  getAttemptCount(orderId: string): number {
    return this.attemptCounts.get(orderId) ?? 0;
  }

  getFulfilledCount(orderId: string): number {
    return this.fulfilledCounts.get(orderId) ?? 0;
  }

  getAttempts(): FulfillmentAttempt[] {
    return [...this.attempts];
  }

  reset(): void {
    this.attempts.length = 0;
    this.attemptCounts.clear();
    this.fulfilledCounts.clear();
    this.failedOnce.clear();
  }

  private shouldFail(orderId: string): boolean {
    switch (this.mode) {
      case "success":
        return false;
      case "alwaysFail":
        return true;
      case "failOncePerOrder": {
        if (!this.failedOnce.has(orderId)) {
          this.failedOnce.add(orderId);
          return true;
        }
        return false;
      }
      case "randomFail":
      default:
        return Math.random() < 0.35;
    }
  }
}
