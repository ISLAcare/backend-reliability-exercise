export type FulfillmentMode = "success" | "failOncePerOrder" | "alwaysFail" | "randomFail";

export type AppConfig = {
  port: number;
  dbPath: string;
  fulfillmentMode: FulfillmentMode;
};

export function loadConfig(): AppConfig {
  const rawPort = Number(process.env.PORT ?? "3000");
  const mode = (process.env.FULFILLMENT_MODE ?? "randomFail") as FulfillmentMode;

  return {
    port: Number.isFinite(rawPort) ? rawPort : 3000,
    dbPath: process.env.DB_PATH ?? "./data/app.db",
    fulfillmentMode: mode
  };
}
