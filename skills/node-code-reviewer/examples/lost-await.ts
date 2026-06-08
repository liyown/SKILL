export async function backgroundJob(payload: string): Promise<void> {
  doWork(payload);
}

async function doWork(_p: string): Promise<void> {
  throw new Error("simulated failure");
}
