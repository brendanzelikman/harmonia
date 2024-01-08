import { useAuthentication } from "providers/authentication";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect the user if authenticated and loaded
export const useAuthenticatedRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthentication();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated]);
};
