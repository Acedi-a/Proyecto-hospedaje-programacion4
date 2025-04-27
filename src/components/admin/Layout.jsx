import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  )
}

