import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { HotelAppProvider } from "./context/HotelAppContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <HotelAppProvider>
        <App />
      </HotelAppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
