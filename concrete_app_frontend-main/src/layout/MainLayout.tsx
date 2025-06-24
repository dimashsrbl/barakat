import { SideBar } from "components/SideBar/SideBar"
import { Outlet } from "react-router-dom"
import { CVNotificationComponent } from "ui/CVNotificationComponent"
import { NotificationCheckComponent } from "ui/NotificationCheckComponent"

export const MainLayout = () => {
    return (
        <div className="df posr">
            <SideBar />
            <NotificationCheckComponent/>
            <CVNotificationComponent/>
            <Outlet />
        </div>
    )
}