// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ✅ DO NOT add AuthProvider or HabitProvider here
// App.jsx already handles AuthProvider
// HabitProvider is added inside the PrivateRoute in App.jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);