import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useUser } from "../../context/UserContext"

export const UserLayout = () => {
  const { userData, isLoadingAuth } = useUser();

  if (isLoadingAuth) {
    return <div>Cargando datos del usuario...</div>;
  }

  console.log("LAYOUT USER DATA: ", userData);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar uid={userData?.uid || ""} />
      <main className="flex-1">
        <Outlet context={{ userData }} />
      </main>
      <Footer />
    </div>
  );
};
