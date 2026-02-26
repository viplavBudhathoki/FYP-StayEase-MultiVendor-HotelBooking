import Sidebar from "./Components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Header from "./Components/Header/Header";

const VendorLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      {/* if sidebar is fixed and width is 260px */}
      <div style={{ flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column" }}>
        <Header />

        <main style={{ padding: "30px", flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;