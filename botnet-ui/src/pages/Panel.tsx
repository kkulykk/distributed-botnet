import React from "react";
import {
  IconButton,
  Badge,
  Button,
  Input,
  Code,
  Checkbox,
} from "@vechaiui/react";

const Panel = () => {
  return (
    <div>
      <div className="mt-8 mx-20">
        <h1 className="text-3xl font-bold text-gray-700">Distributed botnet</h1>
        <p className="text-gray-400 mb-8">version 1.0.0</p>
        <div className=" w-full flex h-full">
          <div className="flex flex-col w-1/2">
            <div className="h-full">
              <p className="text-gray-500 text-base mb-3">Give the target:</p>
              <div className="w-5/6 mb-5">
                <Input.Group>
                  <Input.LeftAddon children="https://" />
                  <Input placeholder="target" />
                </Input.Group>
              </div>
              <p className="text-gray-400 text-sm">Configuration:</p>
              <div className="flex flex-col gap-1 mb-3">
                <Checkbox defaultChecked>Setting string 1</Checkbox>
                <Checkbox defaultChecked>Setting string 2</Checkbox>
                <Checkbox defaultChecked>Setting string 3</Checkbox>
              </div>
              <Button variant="solid" color="primary">
                Start testing
              </Button>
            </div>
            <div className="bg-gray-100 rounded h-full p-3">
              <p className="text-gray-500 text-base mb-3">Bots response log:</p>
              <Code>
                Listen Port - serves as an endpoint in an operating system for
                many types of communication. It is not a hardware device, but a
                logical construct that identifies a service or process. As an
                example, an HTTP server listens on port 80. A port number is
                unique to a process on a device Listen Port - serves as an
                endpoint in an operating system for many types of communication.
                It is not a hardware device, but a logical construct that
                identifies a service or process. As an example, an HTTP server
                listens on port 80. A port number is unique to a process on a
                device
              </Code>
            </div>
          </div>
          <div className="flex-col w-1/2">
            <div className="h-72">
              <div className="flex items-center mb-3 gap-2">
                <p className="text-gray-500 text-base">Connected bots</p>
                <Badge>2</Badge>
              </div>
              <div className="bg-gray-100 h-8 flex items-center p-3 mb-1 rounded">
                <p className="text-gray-700 font-medium text-base ">
                  https://192.168.0.1
                </p>
              </div>
              <div className="bg-gray-100 h-8 flex items-center p-3 mb-1 rounded">
                <p className="text-gray-700 font-medium text-base ">
                  https://192.168.0.1
                </p>
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
            https://192.168.0.1
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
          <p className="text-4xl font-bold text-gray-600 bottom-0">0:50</p>
        </div>

        <Button variant="solid" className="w-20">
          Stop
        </Button>
      </div>
    </div>
  );
};

export default Panel;
