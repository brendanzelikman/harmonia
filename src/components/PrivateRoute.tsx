import { useAuthenticationStatus } from "hooks/useAuthenticationStatus";
import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const Auth = useAuthenticationStatus();

  if (Auth.isLoadingAuthentication) return null;
  if (Auth.isAuthenticated) {
    return children;
  }
  return <Navigate to="/" />;
}
