import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const NavigateToLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authtoken');
    if (!authToken) {
      navigate('/login');
    }
    else {
      navigate('/main/plumblog')
    }
  }, [navigate]);

  return <></>;
};