import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.get("/", (_req, res) => res.json({ service: "iranapi-hello", status: "ok" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.post("/echo", (req, res) => res.json({ received: req.body ?? null }));

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`hello-api listening on ${port}`));
