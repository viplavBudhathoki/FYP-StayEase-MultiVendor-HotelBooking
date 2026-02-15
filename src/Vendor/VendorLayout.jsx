import React from "react";
import Sidebar from "./Components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Header from "./Components/Header/Header";

const VendorLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar component: fixed navigation for vendor */}
      <Sidebar />

      {/* Header component: top navigation bar */}
      <Header />

      {/* Main content area */}
      <div
        style={{
          flex: 1,                
          marginLeft: "260px",     
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Outlet renders nested routes for vendor pages */}
        <main style={{ padding: "30px", flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
