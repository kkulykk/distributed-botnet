import React from "react";
import { VechaiProvider } from "@vechaiui/react";
import Panel from "../src/pages/Panel";
import "./App.css";

function App() {
  return (
    <VechaiProvider>
      <Panel />
    </VechaiProvider>
  );
}

export default App;
