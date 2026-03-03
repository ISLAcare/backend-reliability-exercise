export type MetricsSnapshot = {
  accepted: number;
  fulfilled: number;
  failed: number;
};

export class MetricsService {
  private accepted = 0;
  private fulfilled = 0;
  private failed = 0;

  incrementAccepted(): void {
    this.accepted += 1;
  }

  incrementFulfilled(): void {
    this.fulfilled += 1;
  }

  incrementFailed(): void {
    this.failed += 1;
  }

  snapshot(): MetricsSnapshot {
    return {
      accepted: this.accepted,
      fulfilled: this.fulfilled,
      failed: this.failed
    };
  }
}
