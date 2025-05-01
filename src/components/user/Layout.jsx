import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const UserLayout = ({ uid }) => {
  console.log("LAYOUT ID: ")
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar uid={ uid }/>
      <main className="flex-1">
        <Outlet context={{ uid }} />
      </main>
      <Footer />
    </div>
  );
};