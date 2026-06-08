import express from "express";


const app = express();
app.use(express.json({ limit: "50mb" }));

app.post("/pay", async (req, res, next) => {
  try {
    await payService.charge(req.body);
  } catch (e) {
    next(e);
  }
  res.json({ ok: true });
});
