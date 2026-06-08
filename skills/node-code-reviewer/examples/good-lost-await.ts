/**
 * Good counterpart of lost-await.ts.
 */

export async function backgroundJob(payload: string): Promise<void> {
  // Fix 1 (await the work): the rejection from doWork now propagates to
  // the caller as a real Promise rejection instead of becoming an
  // unhandledRejection event that may crash the process.
  await doWork(payload);
}

async function doWork(_p: string): Promise<void> {
  throw new Error("simulated failure");
}
