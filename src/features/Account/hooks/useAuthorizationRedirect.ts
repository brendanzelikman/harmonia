import { useAuth } from "providers/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect the user if authenticated and loaded
export const useAuthorizationRedirect = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();

  useEffect(() => {
    if (isAuthorized) navigate("/");
  }, [isAuthorized]);
};
