import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Button, Input } from "@vechaiui/react";

const Login = () => {
  const bcrypt = require("bcryptjs");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const handlePasswordChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setPassword(event.target.value);
  };

  const processLogin = async (password: string) => {
    const salt = await bcrypt.genSalt(6);
    const hashedPassword = await bcrypt.hash(password, salt);
    const validPassword = await bcrypt.compare(
      password,
      "$2a$06$sh2NQBdp0WzOkTvG03G8MuapHhwdKQEiMTVDW8okb90CmsQSg0NCK"
    );
    console.log(validPassword);
    if (password !== "" && validPassword) {
      localStorage.setItem("password", hashedPassword);
      navigate("/");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("password")) {
      navigate("/");
    } else {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div>
      <div className="mt-8 mx-20 ">
        <h1 className="text-3xl font-bold text-gray-700">Distributed botnet</h1>
        <p className="text-gray-400 mb-8">version 1.0.3</p>
        <div className="w-full mt-52 flex justify-center items-center">
          <div className="w-52 h-36 flex flex-col gap-2">
            <p className="text-sm text-gray-500">Enter password</p>
            <Input
              className="w-full"
              type={"password"}
              onChange={handlePasswordChange}
            />
            <Button
              className="w-16"
              variant="solid"
              color="primary"
              onClick={() => processLogin(password)}
            >
              Log in
            </Button>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
