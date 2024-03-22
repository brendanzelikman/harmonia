import { useAuthentication } from "providers/authentication";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect the user if authenticated and loaded
export const useAuthorizationRedirect = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuthentication();

  useEffect(() => {
    if (isAuthorized) navigate("/");
  }, [isAuthorized]);
};
