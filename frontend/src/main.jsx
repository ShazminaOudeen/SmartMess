import React from "react";
import ReactDOM from "react-dom/client";
import TestBackend from "./TestBackend";
import App from "./App";
import { ThemeProvider } from './context/ThemeContext';
import HomePage from "./Pages/Home/homepage";  // If in pages folder
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);