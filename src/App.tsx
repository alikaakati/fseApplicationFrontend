import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Home from "./screens/Home";
import Dashboard from "./screens/Dashboard";

const App = () => {
  return (
    <Box display="flex">
      <Sidebar />
      <Box component="main" flexGrow={1} p={3}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
