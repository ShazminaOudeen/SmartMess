import React from "react";
import ReactDOM from "react-dom/client";
import TestBackend from "./TestBackend";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TestBackend />
  </React.StrictMode>
);