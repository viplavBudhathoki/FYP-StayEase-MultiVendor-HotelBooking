import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Components/Sidebar/AdminSidebar";
import Header from "./Components/Header/AdminHeader";

const AdminLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          marginLeft: "270px", // must match sidebar width
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        {/* Header */}
        <Header />

        {/* Scrollable Page Content */}
        <main
          style={{
            flex: 1,
            padding: "30px",
            background: "#f8fafc",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
