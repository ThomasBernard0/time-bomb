import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/PrivateRoute";
import Hub from "./pages/Hub";
import Lobby from "./pages/Lobby";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/hub" element={<PrivateRoute element={<Hub />} />} />
          <Route
            path="/lobby/:code"
            element={<PrivateRoute element={<Lobby />} />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
