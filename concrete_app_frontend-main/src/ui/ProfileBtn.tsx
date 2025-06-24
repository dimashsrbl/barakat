import { SignoutIcon } from "assets/icons/Signout"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export const ProfileBtn = () => {
    const [fullName, setFullName] = useState('');
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();

    const waitForUserInLocalStorage = async () => {
      let attempts = 0;
      const maxAttempts = 10;
      const interval = 500; // Интервал в миллисекундах
  
      while (attempts < maxAttempts) {
        const username = localStorage.getItem("username");
        const userfullname = localStorage.getItem("userfullname");
        const userrole = localStorage.getItem("userrole");
  
        if (username && userrole && userfullname) {
          try {
            setFullName(userfullname);
            setUserRole(userrole)
            break;
          } catch (error) {
            console.error("Error parsing user from localStorage:", error);
            handleSignOut()
          }
        }
  
        attempts += 1;
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    };
  
    useEffect(() => {
      waitForUserInLocalStorage();
    }, []);
  
    const handleSignOut = () => {
      const localStorageKeysToRemove = [
        "authtoken",
        "user",
        "username",
        "userrole",
        "userfullname",
      ];
  
      localStorageKeysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
      navigate("/login");
    };
  
    return (
      <div className="profile-button-style df jcsb aic w100">
        <div className="df fdc jcc">
          <span className="fz16 fw600" style={{ color: "#333" }} title="Ваш Логин">
          {fullName || "Загрузка..."}
          </span>
            <span className="fz14 fw100" style={{ color: "#828282" }} title="Роль">
                {userRole ? userRole : "Роль не определена"}
            </span>
        </div>
        <div onClick={handleSignOut}>
          <SignoutIcon color="#EB5757" />
        </div>
      </div>
    );
  };