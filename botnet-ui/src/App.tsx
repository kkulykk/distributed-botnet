import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { VechaiProvider } from "@vechaiui/react";
import Panel from "../src/pages/Panel";
import Login from "./pages/Login";
import "./App.css";

function App() {
  return (
    <VechaiProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Panel />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </VechaiProvider>
  );
}

export default App;
