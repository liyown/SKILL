/**
 * Good counterpart of double-response.ts.
 */

import express from "express";


const app = express();
// Fix 1 (body limit): cap JSON body size to 100kb. The bad version
// accepted 50mb, which lets a slow attacker exhaust memory.
app.use(express.json({ limit: "100kb" }));

app.post("/pay", async (req, res, next) => {
  try {
    await payService.charge(req.body);
  } catch (e) {
    // Fix 2 (return after next): short-circuit with `return` so the
    // success path's res.json does not run after the error has been
    // handed to the error middleware. The bad version fell through
    // to res.json and triggered "Cannot set headers after they are
    // sent".
    return next(e);
  }
  // Fix 3 (explicit return): symmetric with the catch branch so the
  // function exits with the same shape regardless of success/error.
  return res.json({ ok: true });
});
