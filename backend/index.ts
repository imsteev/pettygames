import express from "express";
import tradeData from "./trades.json" with { type: "json" };
import scheduleData from "./schedule.json" with { type: "json" };
import cors from 'cors';

const app = express();

// middleware
app.use(cors());

app.get("/trades", (_, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(tradeData));
});

app.get("/schedule", (_, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(scheduleData));
});

console.log("running server on port 3000");
app.listen("3000");
